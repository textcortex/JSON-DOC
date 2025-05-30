import React from "react";
import { BlockRenderer } from "../BlockRenderer";

interface OrderedListBlockRendererProps {
  block: any;
  depth?: number;
}

export const OrderedListBlockRenderer: React.FC<OrderedListBlockRendererProps> = ({
  block,
  depth = 0,
}) => {
  return (
    <ol className="notion-selectable notion-ordered_list-block" data-block-id={block.id}>
      {block.children && block.children.length > 0 && 
        block.children.map((child: any, index: number) => (
          <BlockRenderer
            key={child.id || index}
            block={child}
            depth={depth}
          />
        ))
      }
    </ol>
  );
};