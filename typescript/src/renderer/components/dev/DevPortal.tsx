import React from "react";
import { createPortal } from "react-dom";

interface DevPortalProps {
  children: React.ReactNode;
  onBackdropClick?: (e: React.MouseEvent) => void;
}

export const DevPortal: React.FC<DevPortalProps> = ({
  children,
  onBackdropClick,
}) => {
  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
        pointerEvents: onBackdropClick ? "auto" : "none",
      }}
      onClick={onBackdropClick}
    >
      <div style={{ pointerEvents: "auto" }}>{children}</div>
    </div>,
    document.body
  );
};
