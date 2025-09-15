import React from "react";
import { Button } from "@wordpress/components";

function DriveBrowser({ nodes, onFolderClick, onBreadcrumbClick, breadcrumbs }) {
  
  const handleDownload = async (fileId) => {
    try {
      const response = await fetch(
        wpmudevDriveTest.baseUrl + `wp-json/wpmudev/v1/drive/download?file_id=${fileId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();

      if (data.success && data.content) {
        // Convert base64 → Blob
        const byteCharacters = atob(data.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: data.mimeType });

        // Create temporary download link
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = data.filename || "download";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error("Download failed", error);
    }
  };


  return (
    <div>
      {/* Breadcrumb */}
      <ul className="breadcrumb breadcrumb-drive">
        {breadcrumbs.map((bc, index) => (
          <li key={bc.id || "root"}>
            <span
              onClick={() => onBreadcrumbClick(bc.id)}
              style={{ cursor: "pointer" }}
            >
              {bc.name}
            </span>
          </li>
        ))}
      </ul>

      {/* Current Level Files/Folders */}
      <div className="drive-files-grid">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`drive-node ${node.mimeType === "application/vnd.google-apps.folder"
              ? "folder"
              : "file"
              } drive-file-item`}
            onClick={() =>
              node.mimeType === "application/vnd.google-apps.folder"
                ? onFolderClick(node)
                : null
            }
          >
            <div className="file-info">
              <img src={node.iconLink} alt="" className="file-icon" />
              <strong>{node.name}</strong>{" "}
              <small>
                (
                {node.mimeType === "application/vnd.google-apps.folder"
                  ? "Folder"
                  : "File"}
                )
              </small>
              {node.mimeType !== "application/vnd.google-apps.folder" && (
                <small>
                  Size: {node.size ? `${node.size} bytes` : "Unknown"}
                </small>
              )}
              <small>
                {node.modifiedTime
                  ? new Date(node.modifiedTime).toLocaleDateString()
                  : "Unknown date"}
              </small>
            </div>

            <div className="file-actions" onClick={(e) => e.stopPropagation()}>
              {node.webViewLink && (
                <Button
                  variant="link"
                  size="small"
                  href={node.webViewLink}
                  target="_blank"
                >
                  View in Drive
                </Button>
              )}

              {node.mimeType !== "application/vnd.google-apps.folder" && (
                <Button
                  variant="link"
                  size="small"
                  onClick={() => handleDownload(node.id)}
                  target="_blank"
                >
                  Download
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DriveBrowser;
