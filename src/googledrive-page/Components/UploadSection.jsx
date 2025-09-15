import React from 'react'
import { createRoot, render, StrictMode, useState, useEffect, createInterpolateElement } from '@wordpress/element';
import { Button, TextControl, Spinner, Notice } from '@wordpress/components';

const UploadSection = ({ uploadFile,
    setUploadFile,
    handleUpload,
    isLoading, }) => {
    return (
        <>
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
        </>
    )
}

export default UploadSection
