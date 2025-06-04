import React from "react";
import { RichTextRenderer } from "../RichTextRenderer";
import { BlockRenderer } from "../BlockRenderer";

interface ListItemBlockRendererProps {
  block: any;
  type: "bulleted" | "numbered";
  depth?: number;
}

export const ListItemBlockRenderer: React.FC<ListItemBlockRendererProps> = ({
  block,
  type,
  depth = 0,
}) => {
  const listData =
    type === "bulleted" ? block.bulleted_list_item : block.numbered_list_item;

  const blockClassName =
    type === "bulleted"
      ? "notion-bulleted_list-block"
      : "notion-numbered_list-block";

  return (
    <li
      className={`notion-selectable ${blockClassName}`}
      data-block-id={block.id}
    >
      <RichTextRenderer richText={listData?.rich_text || []} />

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
    </li>
  );
};
