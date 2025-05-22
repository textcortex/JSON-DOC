import React from "react";
import { BlockRenderer } from "../BlockRenderer";

interface DividerBlockRendererProps {
  block: any;
  depth?: number;
}

export const DividerBlockRenderer: React.FC<DividerBlockRendererProps> = ({
  block,
  depth = 0,
}) => {
  return (
    <div
      className="notion-selectable notion-divider-block"
      data-block-id={block.id}
    >
      <div className="notion-cursor-default">
        <div role="separator"></div>
      </div>

      {/* Render children blocks recursively */}
      {block.children && block.children.length > 0 && (
        <div
          className="notion-block-children"
          style={{ marginLeft: `${depth * 24}px` }}
        >
          {block.children.map((child: any, index: number) => (
            <BlockRenderer
              key={child.id || index}
              block={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
