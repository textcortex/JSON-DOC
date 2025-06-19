import React from "react";

import { RichTextRenderer } from "../RichTextRenderer";
import { BlockRenderer } from "../BlockRenderer";
import { BulletedListItemBlock } from "../../../models/generated/block/types/bulleted_list_item";
import { NumberedListItemBlock } from "../../../models/generated/block/types/numbered_list_item";

interface ListItemBlockRendererProps
  extends React.HTMLAttributes<HTMLDivElement> {
  block: BulletedListItemBlock | NumberedListItemBlock;
  depth?: number;
  components?: React.ComponentProps<typeof BlockRenderer>["components"];
}

export const ListItemBlockRenderer: React.FC<ListItemBlockRendererProps> = ({
  block,
  depth = 0,
  className,
  components,
  ...props
}) => {
  const listData =
    block.type === "bulleted_list_item"
      ? (block as BulletedListItemBlock).bulleted_list_item
      : (block as NumberedListItemBlock).numbered_list_item;

  const blockClassName =
    block.type === "bulleted_list_item"
      ? "notion-bulleted_list-block"
      : "notion-numbered_list-block";

  return (
    <div
      {...props}
      className={`notion-selectable ${blockClassName} ${className || ""}`.trim()}
      data-block-id={block.id}
    >
      {/* <div className="notion-list-item-box-left" /> */}
      {block.type === "bulleted_list_item" && (
        <div className="notion-list-item-box-left" />
      )}
      <div className="notion-list-content">
        <RichTextRenderer richText={listData?.rich_text || []} />
      </div>

      {/* Render children blocks recursively */}
      {block.children && block.children.length > 0 && (
        <div
          className="notion-block-children"
          style={{ marginLeft: `${depth * 24}px` }}
        >
          {block.children.map((child, index: number) => (
            <BlockRenderer
              key={child.id || `child-${index}`}
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
