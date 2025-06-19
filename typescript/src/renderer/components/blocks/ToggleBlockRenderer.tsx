import React, { useState } from "react";

import { ToggleBlock } from "@/models/generated";

import { RichTextRenderer } from "../RichTextRenderer";
import { BlockRenderer } from "../BlockRenderer";

interface ToggleBlockRendererProps
  extends React.HTMLAttributes<HTMLDivElement> {
  block: ToggleBlock;
  depth?: number;
  components?: React.ComponentProps<typeof BlockRenderer>["components"];
}

export const ToggleBlockRenderer: React.FC<ToggleBlockRendererProps> = ({
  block,
  depth = 0,
  className,
  components,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleData = block.toggle;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      {...props}
      className={`notion-selectable notion-toggle-block${className ? ` ${className}` : ""}`}
      data-block-id={block.id}
    >
      <div
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close" : "Open"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          cursor: "pointer",
        }}
      >
        <div role="button" onClick={handleToggle}>
          <svg
            aria-hidden="true"
            role="graphics-symbol"
            viewBox="0 0 16 16"
            className="arrowCaretDownFillSmall"
            style={{
              width: "14px",
              height: "14px",
              display: "block",
              flexShrink: 0,
              transition: "transform 200ms ease-out",
              transform: isOpen ? "rotate(360deg)" : "rotate(270deg)",
              userSelect: "none",
            }}
          >
            <path d="M2.835 3.25a.8.8 0 0 0-.69 1.203l5.164 8.854a.8.8 0 0 0 1.382 0l5.165-8.854a.8.8 0 0 0-.691-1.203z"></path>
          </svg>
        </div>

        <div className="notranslate">
          <RichTextRenderer richText={toggleData?.rich_text || []} />
        </div>
      </div>

      {/* Render children blocks recursively when toggle is open */}
      {isOpen && block.children && block.children.length > 0 && (
        <div
          style={{
            marginLeft: 18,
          }}
        >
          <div
            className="notion-block-children"
            style={{ marginLeft: `${depth * 24}px` }}
          >
            {block.children.map((child: any, index: number) => (
              <BlockRenderer
                key={child.id || index}
                block={child}
                depth={depth + 1}
                components={components}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
