import React from "react";

interface FloatingButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  offset?: { x: number; y: number };
  backgroundColor?: string;
  color?: string;
  zIndex?: number;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  onClick,
  children,
  position = "top-right",
  offset = { x: 20, y: 20 },
  backgroundColor = "oklch(40% 0.2 250)",
  color = "white",
  zIndex = 1000,
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case "top-left":
        return { top: offset.y, left: offset.x };
      case "bottom-right":
        return { bottom: offset.y, right: offset.x };
      case "bottom-left":
        return { bottom: offset.y, left: offset.x };
      default:
        return { top: offset.y, right: offset.x };
    }
  };

  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        ...getPositionStyles(),
        zIndex,
        padding: "8px 16px",
        background: backgroundColor,
        color,
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {children}
    </button>
  );
};

export default FloatingButton;
