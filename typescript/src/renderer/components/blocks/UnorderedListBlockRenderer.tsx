import React from "react";

import { BlockRenderer } from "../BlockRenderer";

interface UnorderedListBlockRendererProps
  extends React.HTMLAttributes<HTMLUListElement> {
  block: any;
  depth?: number;
  components?: React.ComponentProps<typeof BlockRenderer>["components"];
}

export const UnorderedListBlockRenderer: React.FC<
  UnorderedListBlockRendererProps
> = ({ block, depth = 0, className, components, ...props }) => {
  return (
    <ul
      {...props}
      className={`notion-selectable notion-unordered_list-block${className ? ` ${className}` : ""}`}
      data-block-id={block.id}
    >
      {block.children &&
        block.children.length > 0 &&
        block.children.map((child: any, index: number) => (
          <BlockRenderer
            key={child.id || index}
            block={child}
            depth={depth}
            components={components}
          />
        ))}
    </ul>
  );
};
