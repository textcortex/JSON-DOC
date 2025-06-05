import React from "react";

import { BlockRenderer } from "../BlockRenderer";

interface OrderedListBlockRendererProps
  extends React.HTMLAttributes<HTMLOListElement> {
  block: any;
  depth?: number;
  components?: React.ComponentProps<typeof BlockRenderer>["components"];
}

export const OrderedListBlockRenderer: React.FC<
  OrderedListBlockRendererProps
> = ({ block, depth = 0, className, components, ...props }) => {
  return (
    <ol
      {...props}
      className={`notion-selectable notion-ordered_list-block${className ? ` ${className}` : ""}`}
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
    </ol>
  );
};
