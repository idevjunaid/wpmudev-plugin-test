import React from 'react'
import { createRoot, render, StrictMode, useState, useEffect, createInterpolateElement } from '@wordpress/element';
import { Button, TextControl, Spinner, Notice } from '@wordpress/components';
import DriveBrowser from './DriveBrowser';

const FilesSection = ({ files,
    isLoading,
    loadFiles,
    currentFolderID,
    setcurrentFolderID,
    breadcrumbs, handleFolderClick, handleBreadcrumbClick, handlePrevPage, handleNextPage, prevTokens, nextPageToken }) => {
    return (
        <>
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
                    ) :
                        (<>
                            <div className="drive-files-grid">
                                <DriveBrowser
                                    currentFolderID={currentFolderID}
                                    setcurrentFolderID={setcurrentFolderID}
                                    nodes={files}
                                    breadcrumbs={breadcrumbs}
                                    onFolderClick={handleFolderClick}
                                    onBreadcrumbClick={handleBreadcrumbClick}
                                />

                                {
                                    Object.keys(files).length == 0 && <div className="sui-box-settings-row">
                                        <p>No files found in your Drive. Upload a file or create a folder to get started.....</p>
                                    </div>
                                }
                                
                                <div className="flex gap-2">
                                    <button className='custom-btn' onClick={handlePrevPage} hidden={prevTokens.length === 0}>
                                        Previous
                                    </button>
                                    <button className='custom-btn' onClick={handleNextPage} hidden={!nextPageToken}>
                                        Next
                                    </button>
                                </div>
                            </div>

                        </>
                        )
                    }



                </div>
            </div>
        </>
    )
}

export default FilesSection
