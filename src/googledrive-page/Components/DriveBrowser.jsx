import React, { useState } from "react";
import { Button } from "@wordpress/components";

function DriveBrowser({ nodes }) {
  const [path, setPath] = useState([]); // breadcrumb path

  // Find current folder based on path
  const currentNodes = (
    path.length === 0 ? nodes : path[path.length - 1].children || []
  )
    .slice()
    .sort((a, b) => {
      const isFolderA = a.mimeType === "application/vnd.google-apps.folder";
      const isFolderB = b.mimeType === "application/vnd.google-apps.folder";
      if (isFolderA === isFolderB) return a.name.localeCompare(b.name); // sort alphabetically if same type
      return isFolderA ? -1 : 1; // folders first
    });

  const handleFolderClick = (folder) => {
    setPath([...path, folder]);
  };

  const handleBreadcrumbClick = (index) => {
    setPath(path.slice(0, index + 1));
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => setPath([])} style={{ cursor: "pointer" }}>
          Root
        </span>
        {path.map((p, index) => (
          <span key={p.id}>
            {" > "}
            <span
              onClick={() => handleBreadcrumbClick(index)}
              style={{ cursor: "pointer" }}
            >
              {p.name}
            </span>
          </span>
        ))}
      </div>

      {/* Current Level */}
      <div className="drive-files-grid">
        {currentNodes.map((node) => (
          <div
            key={node.id}
            className={`drive-node ${
              node.mimeType === "application/vnd.google-apps.folder"
                ? "folder"
                : "file"
            } drive-file-item`}
            onClick={() =>
              node.mimeType === "application/vnd.google-apps.folder"
                ? handleFolderClick(node)
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
