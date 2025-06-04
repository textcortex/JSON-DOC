import React from "react";

import { BlockRenderer } from "../BlockRenderer";

interface DividerBlockRendererProps extends React.HTMLAttributes<HTMLDivElement> {
  block: any;
  depth?: number;
  components?: React.ComponentProps<typeof BlockRenderer>['components'];
}

export const DividerBlockRenderer: React.FC<DividerBlockRendererProps> = ({
  block,
  depth = 0,
  className,
  components,
  ...props
}) => {
  return (
    <div
      {...props}
      className={`notion-selectable notion-divider-block${className ? ` ${className}` : ''}`}
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
              components={components}
            />
          ))}
        </div>
      )}
    </div>
  );
};
