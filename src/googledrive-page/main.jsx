import { createRoot, render, StrictMode, useState, useEffect, createInterpolateElement } from '@wordpress/element';
import { Button, TextControl, Spinner, Notice } from '@wordpress/components';
import uniqueId from 'lodash/uniqueId';
import DriveBrowser from './Components/DriveBrowser';
import "./scss/style.scss"
import CredentialsForm from './Components/CredentialsForm';

const domElement = document.getElementById(window.wpmudevDriveTest.dom_element_id);

const WPMUDEV_DriveTest = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(window.wpmudevDriveTest.authStatus || false);
    const [hasCredentials, setHasCredentials] = useState(window.wpmudevDriveTest.hasCredentials || false);
    const [showCredentials, setShowCredentials] = useState(!window.wpmudevDriveTest.hasCredentials);
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [currentFolderID, setcurrentFolderID] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [folderName, setFolderName] = useState('');
    const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: "Root" }]);

    const [notice, setNotice] = useState({ message: '', type: '' });


    const [notices, setNotices] = useState([]);
    const addNotice = (status, content) => {
        const id = uniqueId("notice-");
        setNotices((prev) => [
            ...prev,
            { id: id, status, content },
        ]);
        // setTimeout(() => removeNotice(id), 5000); // Auto-remove after 5 seconds
    };

    useEffect(() => {
        addNotice('info', 'Welcome to the Google Drive Test Interface!');
        addNotice('info', 'Welcome to the Google Drive Test Interface!');
        addNotice('info', 'Welcome to the Google Drive Test Interface!');
    }, [])

    const removeNotice = (id) => {
        setNotices((prev) => prev.filter((n) => n.id !== id));
    };

    window.notices = notices;
    window.addNotice = addNotice;
    window.removeNotice = removeNotice;


    const [credentials, setCredentials] = useState({
        clientId: '',
        clientSecret: ''
    });


    useEffect(() => {
    }, [isAuthenticated]);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.auth === "success") {
                setIsLoading(false);
                addNotice('success', 'Authorization successful!');
                setIsAuthenticated(true);
            }
            if (event.data.auth === "error") {
                setIsLoading(false);
                addNotice('error', 'Authorization failed. Please try again.');
            }
        };

        window.addEventListener("message", handleMessage);
        if (hasCredentials && isAuthenticated) {
            addNotice('info', 'Loading files from Drive...');
            loadFiles();
        }
        return () => window.removeEventListener("message", handleMessage);
    }, []);


    const handleSaveCredentials = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(wpmudevDriveTest.baseUrl + "wp-json/wpmudev/v1/drive/save-credentials", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            if (data) {
                setShowCredentials(false);
                setHasCredentials(true);
                setIsAuthenticated(false);
                addNotice('success', 'Credentials saved successfully. Please authenticate with Google Drive.');
                setIsLoading(false);
            }
        } catch (error) {
            addNotice('error', 'Error saving credentials.');
            setIsLoading(false);
        }

    };

    const handleAuth = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                wpmudevDriveTest.baseUrl + "wp-json/wpmudev/v1/drive/auth",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                }
            );
            const data = await response.json();
            if (data.auth_url) {
                const popup = window.open(data.auth_url, "_blank", "width=500,height=600");

                // Poll for close / URL changes
                const popupTimer = setInterval(() => {
                    console.log("Checking popup...");
                    if (!popup || popup.closed) {
                        clearInterval(popupTimer);
                        setIsLoading(false);
                        console.log("Popup closed");
                        return;
                    }

                    try {
                        // Only works if popup is same-origin
                        console.log("Popup URL:", popup.location.href);
                    } catch (e) {
                        // Different origin (Google OAuth, etc.) → ignore until redirect back to your domain
                    }
                }, 500);
                // spinner stays active until message received
            } else {
                addNotice('error', 'No authentication URL returned.');
                setIsLoading(false);
            }
        } catch (error) {
            addNotice('error', 'Error during authentication.');
            setIsLoading(false);
        }
    };


    const [pageToken, setPageToken] = useState(null);
    const [nextPageToken, setNextPageToken] = useState(null);
    const [prevTokens, setPrevTokens] = useState([]); // stack for "previous"

    const loadFiles = async (folderId = null, token = null) => {
        setIsLoading(true);
        try {
            const url = new URL(wpmudevDriveTest.baseUrl + "wp-json/wpmudev/v1/drive/files");

            if (folderId) url.searchParams.append("parentId", folderId);
            if (token) url.searchParams.append("pageToken", token);

            const response = await fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();

            if (data.files) {
                setFiles(data.files);
                setNextPageToken(data.nextPageToken || null);
                setPageToken(token); // track current
            } else {
                addNotice("error", "No files returned from Drive.");
            }
        } catch (error) {
            addNotice("error", "Error loading files from Drive.");
        }
        setIsLoading(false);
    };

    // Folder click → push into breadcrumb and load children
    const handleFolderClick = (folder) => {
        setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
        loadFiles(folder.id);
        setcurrentFolderID(folder.id);
    };

    // Breadcrumb click → slice array and load that folder
    const handleBreadcrumbClick = (id) => {
        const idx = breadcrumbs.findIndex((b) => b.id === id);
        if (idx !== -1) {
            setBreadcrumbs(breadcrumbs.slice(0, idx + 1));
            loadFiles(id);
        }
        setcurrentFolderID(id);
    };


    // Go to next page
    const handleNextPage = () => {
        if (nextPageToken) {
            setPrevTokens([...prevTokens, pageToken]); // push current into history
            loadFiles(currentFolderID, nextPageToken);
        }
    };

    // Go to previous page
    const handlePrevPage = () => {
        if (prevTokens.length > 0) {
            const newPrev = [...prevTokens];
            const prevToken = newPrev.pop();
            setPrevTokens(newPrev);
            loadFiles(currentFolderID, prevToken);
        }
    };

    const handleUpload = async () => {
        if (!uploadFile) {
            addNotice('error', 'Please select a file to upload.');
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", uploadFile);

            const response = await fetch(
                wpmudevDriveTest.baseUrl + "wp-json/wpmudev/v1/drive/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                loadFiles(currentFolderID);
                setUploadFile(null);
                alert(`Uploaded: ${data.file.name}`);
                addNotice('success', `File "${data.file.name}" uploaded successfully.`);
            } else {
                alert("Upload failed!");
                addNotice('error', 'File upload failed.');
            }
        } catch (error) {
            addNotice('error', 'Error uploading file.');
        } finally {
            setIsLoading(false);
        }
    };



    const handleDownload = async (fileId, fileName) => {
    };

    const handleCreateFolder = async () => {
        if (!folderName.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                wpmudevDriveTest.baseUrl + "wp-json/wpmudev/v1/drive/create-folder",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: folderName,
                        parentId: currentFolderID || null,
                    }),
                }
            );
            const data = await response.json();
            const newFolder = data.folder;
            addNotice('success', `Folder "${newFolder.name}" created successfully.`);
            setFolderName("");
            loadFiles(currentFolderID);
        } catch (error) {

            addNotice('error', 'Error creating folder.');
            addNotice('error', error.message);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <>
            <div className="sui-header">
                <h1 className="sui-header-title">
                    Google Drive Test {isAuthenticated ? '(Authenticated)' : '-'} {!hasCredentials && '(No Credentials Set)'} {showCredentials && '(show Credentials)'}
                </h1>
                <p className="sui-description">Test Google Drive API integration for applicant assessment</p>
            </div>
            <div className="sui-notices">
                {notices.map((notice) => (
                    <Notice
                        key={notice.id}
                        status={notice.status} // "error" | "success" | "warning" | "info"
                        isDismissible={true}
                        onRemove={() => removeNotice(notice.id)}
                    >
                        {notice.content}
                    </Notice>
                ))}
            </div>


            {showCredentials ? (
                <CredentialsForm
                    credentials={credentials}
                    setCredentials={setCredentials}
                    handleSaveCredentials={handleSaveCredentials}
                    isLoading={isLoading} />
            ) : !isAuthenticated ? (
                <div className="sui-box">
                    <div className="sui-box-header">
                        <h2 className="sui-box-title">Authenticate with Google Drive</h2>
                    </div>
                    <div className="sui-box-body">
                        <div className="sui-box-settings-row">
                            <p>Please authenticate with Google Drive to proceed with the test.</p>
                            <p><strong>This test will require the following permissions:</strong></p>
                            <ul>
                                <li>View and manage Google Drive files</li>
                                <li>Upload new files to Drive</li>
                                <li>Create folders in Drive</li>
                            </ul>
                        </div>
                    </div>
                    <div className="sui-box-footer">
                        <div className="sui-actions-left">
                            <Button
                                variant="secondary"
                                onClick={() => setShowCredentials(true)}
                            >
                                Change Credentials
                            </Button>
                        </div>
                        <div className="sui-actions-right">
                            <Button
                                variant="primary"
                                onClick={handleAuth}
                                disabled={isLoading}
                            >
                                {isLoading ? <Spinner /> : 'Authenticate with Google Drive'}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* File Upload Section */}
                    <div className="sui-box">
                        <div className="sui-box-header">
                            <h2 className="sui-box-title">Upload File to Drive</h2>
                        </div>
                        <div className="sui-box-body">
                            <div className="sui-box-settings-row">
                                <input
                                    type="file"
                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                    className="drive-file-input"
                                />
                                {uploadFile && (
                                    <p><strong>Selected:</strong> {uploadFile.name} ({Math.round(uploadFile.size / 1024)} KB)</p>
                                )}
                            </div>
                        </div>
                        <div className="sui-box-footer">
                            <div className="sui-actions-right">
                                <Button
                                    variant="primary"
                                    onClick={handleUpload}
                                    disabled={isLoading || !uploadFile}
                                >
                                    {isLoading ? <Spinner /> : 'Upload to Drive'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Create Folder Section */}
                    <div className="sui-box">
                        <div className="sui-box-header">
                            <h2 className="sui-box-title">Create New Folder</h2>
                        </div>
                        <div className="sui-box-body">
                            <div className="sui-box-settings-row">
                                <TextControl
                                    label="Folder Name"
                                    value={folderName}
                                    onChange={setFolderName}
                                    placeholder="Enter folder name"
                                />
                            </div>
                        </div>
                        <div className="sui-box-footer">
                            <div className="sui-actions-right">
                                <Button
                                    variant="secondary"
                                    onClick={handleCreateFolder}
                                    disabled={isLoading || !folderName.trim()}
                                >
                                    {isLoading ? <Spinner /> : 'Create Folder'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Files List Section */}
                    <div className="sui-box">
                        <div className="sui-box-header">
                            <h2 className="sui-box-title">Your Drive Files</h2>
                            <div className="sui-actions-right">
                                <Button
                                    variant="secondary"
                                    onClick={loadFiles}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Spinner /> : 'Refresh Files'}
                                </Button>
                            </div>
                        </div>
                        <div className="sui-box-body">
                            {isLoading ? (
                                <div className="drive-loading">
                                    <Spinner />
                                    <p>Loading files...</p>
                                </div>
                            ) : Object.keys(files).length > 0 ? (
                                <div className="drive-files-grid">
                                    <DriveBrowser
                                        currentFolderID={currentFolderID}
                                        setcurrentFolderID={setcurrentFolderID}
                                        nodes={files}
                                        breadcrumbs={breadcrumbs}
                                        onFolderClick={handleFolderClick}
                                        onBreadcrumbClick={handleBreadcrumbClick}
                                    />

                                    <div className="flex gap-2">
                                        <button onClick={handlePrevPage} disabled={prevTokens.length === 0}>
                                            Previous
                                        </button>
                                        <button onClick={handleNextPage} disabled={!nextPageToken}>
                                            Next
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="sui-box-settings-row">
                                    <p>No files found in your Drive. Upload a file or create a folder to get started.....</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

if (createRoot) {
    createRoot(domElement).render(<StrictMode><WPMUDEV_DriveTest /></StrictMode>);
} else {
    render(<StrictMode><WPMUDEV_DriveTest /></StrictMode>, domElement);
}