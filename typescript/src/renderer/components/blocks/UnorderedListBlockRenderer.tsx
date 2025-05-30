import React from "react";
import { BlockRenderer } from "../BlockRenderer";

interface UnorderedListBlockRendererProps {
  block: any;
  depth?: number;
}

export const UnorderedListBlockRenderer: React.FC<UnorderedListBlockRendererProps> = ({
  block,
  depth = 0,
}) => {
  return (
    <ul className="notion-selectable notion-unordered_list-block" data-block-id={block.id}>
      {block.children && block.children.length > 0 && 
        block.children.map((child: any, index: number) => (
          <BlockRenderer
            key={child.id || index}
            block={child}
            depth={depth}
          />
        ))
      }
    </ul>
  );
};