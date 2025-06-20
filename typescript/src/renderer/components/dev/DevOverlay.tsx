import React, { useEffect, useRef, useState } from "react";

interface DevOverlayProps {
  block: any;
  position: { x: number; y: number };
  onClose: () => void;
}

export const DevOverlay: React.FC<DevOverlayProps> = ({
  block,
  position,
  onClose,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState(position);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");
  const [size, setSize] = useState({ width: 500, height: 400 });

  // Handle dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setCurrentPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      } else if (isResizing && overlayRef.current) {
        const rect = overlayRef.current.getBoundingClientRect();
        const newSize = { ...size };
        const newPosition = { ...currentPosition };

        if (resizeDirection.includes("right")) {
          newSize.width = Math.max(300, e.clientX - rect.left);
        }
        if (resizeDirection.includes("left")) {
          const newWidth = Math.max(300, rect.right - e.clientX);
          const widthDiff = newWidth - size.width;
          newSize.width = newWidth;
          newPosition.x = currentPosition.x - widthDiff;
        }
        if (resizeDirection.includes("bottom")) {
          newSize.height = Math.max(200, e.clientY - rect.top);
        }
        if (resizeDirection.includes("top")) {
          const newHeight = Math.max(200, rect.bottom - e.clientY);
          const heightDiff = newHeight - size.height;
          newSize.height = newHeight;
          newPosition.y = currentPosition.y - heightDiff;
        }

        setSize(newSize);
        setCurrentPosition(newPosition);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection("");
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [
    isDragging,
    isResizing,
    dragOffset,
    resizeDirection,
    size,
    currentPosition,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDragging || isResizing) return; // Don't close while dragging or resizing
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // Add a small delay to prevent immediate closing from the opening click
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, isDragging, isResizing]);

  const adjustedPosition = {
    x: Math.min(Math.max(0, currentPosition.x), window.innerWidth - size.width),
    y: Math.min(
      Math.max(0, currentPosition.y),
      window.innerHeight - size.height
    ),
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left click
    const rect = overlayRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleResizeStart = (direction: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizeDirection(direction);
    setIsResizing(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(block, null, 2));
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="dev-json-overlay"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: adjustedPosition.y,
        left: adjustedPosition.x,
        width: size.width,
        height: size.height,
        zIndex: 9999,
        background: "#1a1a1a",
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "16px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseDown={(e) => e.stopPropagation()} // Prevent bubbling to DevPortal
    >
      <div
        className="dev-header"
        onMouseDown={handleMouseDown}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          paddingBottom: "8px",
          borderBottom: "1px solid #333",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontWeight: "bold",
            color: "#60a5fa",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ opacity: 0.6 }}
          >
            <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z" />
          </svg>
          Block JSON ({block.type || "unknown"})
        </span>
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={handleCopy}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "14px",
              padding: "4px 8px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            title="Copy block JSON to clipboard"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ opacity: 0.8 }}
            >
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            Copy
          </button>
          <button
          onClick={onClose}
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking close button
          style={{
            background: "none",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: "16px",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          ×
        </button>
        </div>
      </div>
      <pre
        style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          color: "#e5e5e5",
          lineHeight: "1.4",
          flex: 1,
          overflow: "auto",
          minHeight: 0, // Allow flexbox to shrink below content size
        }}
      >
        {JSON.stringify(block, null, 2)}
      </pre>

      {/* Resize handles */}
      <div
        data-resize-handle="right"
        onMouseDown={handleResizeStart("right")}
        style={{
          position: "absolute",
          top: 0,
          right: "-4px", // Extend outside for easier access
          width: "8px",
          height: "100%",
          cursor: "ew-resize",
          zIndex: 10,
        }}
      />
      <div
        onMouseDown={handleResizeStart("bottom")}
        style={{
          position: "absolute",
          bottom: "-4px", // Extend outside for easier access
          left: 0,
          width: "100%",
          height: "8px",
          cursor: "ns-resize",
          zIndex: 10,
        }}
      />
      <div
        onMouseDown={handleResizeStart("left")}
        style={{
          position: "absolute",
          top: 0,
          left: "-4px", // Extend outside for easier access
          width: "8px",
          height: "100%",
          cursor: "ew-resize",
          zIndex: 10,
        }}
      />
      <div
        onMouseDown={handleResizeStart("top")}
        style={{
          position: "absolute",
          top: "-4px", // Extend outside for easier access
          left: 0,
          width: "100%",
          height: "8px",
          cursor: "ns-resize",
          zIndex: 10,
        }}
      />
      {/* Corner resize handles */}
      <div
        onMouseDown={handleResizeStart("bottom-right")}
        style={{
          position: "absolute",
          bottom: "-8px",
          right: "-8px",
          width: "16px",
          height: "16px",
          cursor: "nwse-resize",
          zIndex: 11,
        }}
      />
      <div
        onMouseDown={handleResizeStart("bottom-left")}
        style={{
          position: "absolute",
          bottom: "-8px",
          left: "-8px",
          width: "16px",
          height: "16px",
          cursor: "nesw-resize",
          zIndex: 11,
        }}
      />
      <div
        onMouseDown={handleResizeStart("top-right")}
        style={{
          position: "absolute",
          top: "-8px",
          right: "-8px",
          width: "16px",
          height: "16px",
          cursor: "nesw-resize",
          zIndex: 11,
        }}
      />
      <div
        onMouseDown={handleResizeStart("top-left")}
        style={{
          position: "absolute",
          top: "-8px",
          left: "-8px",
          width: "16px",
          height: "16px",
          cursor: "nwse-resize",
          zIndex: 11,
        }}
      />
    </div>
  );
};
