import React from 'react'
import { createRoot, render, StrictMode, useState, useEffect, createInterpolateElement } from '@wordpress/element';
import { Button, TextControl, Spinner, Notice } from '@wordpress/components';
const CreateFolderSection = ({ folderName,
    setFolderName,
    handleCreateFolder,
    isLoading, }) => {
    return (
        <>
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
        </>
    )
}

export default CreateFolderSection
