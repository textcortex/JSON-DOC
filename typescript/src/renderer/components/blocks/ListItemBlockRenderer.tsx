import React from "react";

import { RichTextRenderer } from "../RichTextRenderer";
import { BlockRenderer } from "../BlockRenderer";

interface ListItemBlockRendererProps
  extends React.HTMLAttributes<HTMLDivElement> {
  block: any;
  type: "bulleted" | "numbered";
  depth?: number;
  components?: React.ComponentProps<typeof BlockRenderer>["components"];
}

export const ListItemBlockRenderer: React.FC<ListItemBlockRendererProps> = ({
  block,
  type,
  depth = 0,
  className,
  components,
  ...props
}) => {
  const listData =
    type === "bulleted" ? block.bulleted_list_item : block.numbered_list_item;

  const blockClassName =
    type === "bulleted"
      ? "notion-bulleted_list-block"
      : "notion-numbered_list-block";

  return (
    <div
      {...props}
      className={`notion-selectable ${blockClassName} ${className || ""}`.trim()}
      data-block-id={block.id}
    >
      {/* <div className="notion-list-item-box-left" /> */}
      {type === "bulleted" && <div className="notion-list-item-box-left" />}
      <div>
        <RichTextRenderer richText={listData?.rich_text || []} />
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
