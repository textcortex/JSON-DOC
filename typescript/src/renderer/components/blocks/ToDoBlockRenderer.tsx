import React from "react";

import { ToDoBlock } from "@/models/generated";

import { RichTextRenderer } from "../RichTextRenderer";
import { BlockRenderer } from "../BlockRenderer";

interface ToDoBlockRendererProps extends React.HTMLAttributes<HTMLDivElement> {
  block: ToDoBlock;
  depth?: number;
  components?: React.ComponentProps<typeof BlockRenderer>["components"];
}

export const ToDoBlockRenderer: React.FC<ToDoBlockRendererProps> = ({
  block,
  depth = 0,
  className,
  components,
  ...props
}) => {
  const todoData = block.to_do;
  const isChecked = todoData?.checked || false;

  return (
    <div
      {...props}
      className={`notion-selectable notion-to_do-block ${className || ""}`.trim()}
      data-block-id={block.id}
    >
      <div className="pseudoHover pseudoActive">
        <input className="check" type="checkbox" checked={isChecked} readOnly />
      </div>
      <div className={`notranslate ${isChecked ? "checked" : ""}`.trim()}>
        <RichTextRenderer richText={todoData?.rich_text || []} />
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
              components={components}
            />
          ))}
        </div>
      )}
    </div>
  );
};
