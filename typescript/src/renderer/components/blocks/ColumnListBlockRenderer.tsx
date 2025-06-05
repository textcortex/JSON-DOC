import React from "react";

import { BlockRenderer } from "../BlockRenderer";

interface ColumnListBlockRendererProps
  extends React.HTMLAttributes<HTMLDivElement> {
  block: any;
  depth?: number;
  components?: React.ComponentProps<typeof BlockRenderer>["components"];
}

export const ColumnListBlockRenderer: React.FC<
  ColumnListBlockRendererProps
> = ({ block, depth = 0, className, components, ...props }) => {
  return (
    <div
      {...props}
      className={`notion-selectable notion-column_list-block${className ? ` ${className}` : ""}`}
      data-block-id={block.id}
    >
      <div
        className="notion-column-list"
        style={{ display: "flex", gap: "16px" }}
      >
        {block.children?.map((child: any, index: number) => {
          if (child?.type === "column") {
            return (
              <div
                key={child.id || index}
                className="notion-column"
                style={{ flex: 1, minWidth: 0 }}
              >
                {child.children?.map(
                  (columnChild: any, columnIndex: number) => (
                    <BlockRenderer
                      key={columnChild.id || columnIndex}
                      block={columnChild}
                      depth={depth + 1}
                      components={components}
                    />
                  )
                )}
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Render other non-column children blocks recursively */}
      {block.children && block.children.length > 0 && (
        <div
          className="notion-block-children"
          style={{ marginLeft: `${depth * 24}px` }}
        >
          {block.children
            .filter((child: any) => child?.type !== "column")
            .map((child: any, index: number) => (
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
