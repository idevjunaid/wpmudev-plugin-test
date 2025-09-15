import React from "react";
import { Button } from "@wordpress/components";

function DriveBrowser({ nodes, onFolderClick, onBreadcrumbClick, breadcrumbs }) {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        {breadcrumbs.map((bc, index) => (
          <span key={bc.id || "root"}>
            <span
              onClick={() => onBreadcrumbClick(bc.id)}
              style={{ cursor: "pointer" }}
            >
              {bc.name}
            </span>
            {index < breadcrumbs.length - 1 ? " / " : ""}
          </span>
        ))}
      </div>

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
                  href={node.webContentLink}
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
