import React, { useState } from "react";

import { DevPortal } from "./DevPortal";
import { DevOverlay } from "./DevOverlay";

interface DevWrapperProps {
  block: any;
  children: React.ReactNode;
}

export const DevWrapper: React.FC<DevWrapperProps> = ({ block, children }) => {
  const [showJson, setShowJson] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!showJson) {
      setPosition({ x: e.clientX, y: e.clientY + 20 });
      setShowJson(true);
    }
  };

  return (
    <div
      className="dev-block-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        outline: isHovered ? "2px dashed #60a5fa" : "none",
        outlineOffset: "2px",
        transition: "outline 0.2s ease",
      }}
    >
      {children}
      {isHovered && (
        <div
          onClick={handleBadgeClick}
          style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            background: "#60a5fa",
            color: "#ffffff",
            fontSize: "10px",
            padding: "2px 6px",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontWeight: "bold",
            zIndex: 10,
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          {block.type || "unknown"}
        </div>
      )}
      {showJson && (
        <DevPortal
          onBackdropClick={(e) => {
            // Don't close if clicking on resize handles (they extend outside the popup)
            const target = e.target as HTMLElement;
            if (
              target.hasAttribute?.("data-resize-handle") ||
              target.style?.cursor?.includes("resize") ||
              target.style?.zIndex === "10" ||
              target.style?.zIndex === "11"
            ) {
              return;
            }
            setShowJson(false);
          }}
        >
          <DevOverlay
            block={block}
            position={position}
            onClose={() => setShowJson(false)}
          />
        </DevPortal>
      )}
    </div>
  );
};
