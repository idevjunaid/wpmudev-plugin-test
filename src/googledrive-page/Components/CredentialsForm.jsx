

import React from 'react'
import { Button, TextControl, Spinner, Notice } from '@wordpress/components';
import { createRoot, render, StrictMode, useState, useEffect, createInterpolateElement } from '@wordpress/element';

const CredentialsForm = ({ credentials,
    setCredentials,
    handleSaveCredentials,
    isLoading }) => {
    return (
        <>
            <div className="sui-box">
                <div className="sui-box-header">
                    <h2 className="sui-box-title">Set Google Drive Credentials</h2>
                </div>
                <div className="sui-box-body">
                    <div className="sui-box-settings-row">
                        <TextControl
                            help={createInterpolateElement(
                                'You can get Client ID from <a>Google Cloud Console</a>. Make sure to enable Google Drive API.',
                                {
                                    a: <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" />,
                                }
                            )}
                            label="Client ID"
                            value={credentials.clientId}
                            onChange={(value) => setCredentials({ ...credentials, clientId: value })}
                        />
                    </div>

                    <div className="sui-box-settings-row">
                        <TextControl
                            help={createInterpolateElement(
                                'You can get Client Secret from <a>Google Cloud Console</a>.',
                                {
                                    a: <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" />,
                                }
                            )}
                            label="Client Secret"
                            value={credentials.clientSecret}
                            onChange={(value) => setCredentials({ ...credentials, clientSecret: value })}
                            type="password"
                        />
                    </div>

                    <div className="sui-box-settings-row">
                        <span>Please use this URL <em>{window.wpmudevDriveTest.redirectUri}</em> in your Google API's <strong>Authorized redirect URIs</strong> field.</span>
                    </div>

                    <div className="sui-box-settings-row">
                        <p><strong>Required scopes for Google Drive API:</strong></p>
                        <ul>
                            <li>https://www.googleapis.com/auth/drive.file</li>
                            <li>https://www.googleapis.com/auth/drive.readonly</li>
                        </ul>
                    </div>
                </div>
                <div className="sui-box-footer">
                    <div className="sui-actions-right">
                        <Button
                            variant="primary"
                            onClick={handleSaveCredentials}
                            disabled={isLoading}
                        >
                            {isLoading ? <Spinner /> : 'Save Credentials'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CredentialsForm
