import React from "react";

import { BlockRenderer } from "../BlockRenderer";

interface EquationBlockRendererProps extends React.HTMLAttributes<HTMLDivElement> {
  block: any;
  depth?: number;
  components?: React.ComponentProps<typeof BlockRenderer>['components'];
}

export const EquationBlockRenderer: React.FC<EquationBlockRendererProps> = ({
  block,
  depth = 0,
  className,
  components,
  ...props
}) => {
  const equationData = block.equation;

  return (
    <div
      {...props}
      className={`notion-selectable notion-equation-block${className ? ` ${className}` : ''}`}
      data-block-id={block.id}
    >
      <div>
        <div className="notion-equation-display">
          <div className="notion-equation-content">
            {equationData?.expression || ""}
          </div>
        </div>
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
