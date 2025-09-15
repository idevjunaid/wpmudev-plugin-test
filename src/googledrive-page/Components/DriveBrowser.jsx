import React, { useState } from "react";
import { Button } from "@wordpress/components";

function DriveBrowser({ nodes, currentFolderID, setcurrentFolderID }) {
  const files = [];
  for (let id in nodes) {
    const node = nodes[id];
    const parent = node.parents && node.parents[0]; // will get null or parent ID


    //Root
    if (currentFolderID === null) {
      if (node.parents === null) {
        files.push(nodes[id]);
      } else if (!nodes[parent]) {
        files.push(nodes[id]);
      }
    } else if (parent === currentFolderID) {
      files.push(nodes[id]);
    }
  }

  //current Folder ID -> in list then is not root
  // shift it's name to breadcrumb
  // if root shift root to breadcrumb

  function buildBreadcrumb(folderID) {
    let breadcrumb = [];
    if (folderID === null) {
      return [null];
    }

    //remove
    if (!nodes[folderID]) {
      return [null];
    }

    breadcrumb.unshift(folderID);
    let parentID = nodes[folderID].parents ? nodes[folderID].parents[0] : null;
    if (!parentID) {
      breadcrumb.unshift(null)
    }

    return [...buildBreadcrumb(parentID), ...breadcrumb];
  }

  const handleFolderClick = (folder) => {
    setcurrentFolderID(folder.id);
  };
  
  const handleBreadcrumbClick = (folderId) => {
    setcurrentFolderID(folderId);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        {buildBreadcrumb(currentFolderID).map((p, index) => (
          <span key={index}>
            <span
              onClick={() => handleBreadcrumbClick(p)}
              style={{ cursor: "pointer" }}
              >
              {nodes[p] ? nodes[p].name : "Root"} {index < buildBreadcrumb(currentFolderID).length - 1 ? " / " : ""} 
            </span>
          </span>
        ))}
      </div>

      {/* Current Level */}
      <div className="drive-files-grid">
        {files.map((node) => (
          <div
            key={node.id}
            className={`drive-node ${node.mimeType === "application/vnd.google-apps.folder"
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
