import React from "react";

import { RichTextRenderer } from "../RichTextRenderer";
import { BlockRenderer } from "../BlockRenderer";

interface ParagraphBlockRendererProps
  extends React.HTMLAttributes<HTMLDivElement> {
  block: any;
  depth?: number;
  components?: React.ComponentProps<typeof BlockRenderer>["components"];
}

export const ParagraphBlockRenderer: React.FC<ParagraphBlockRendererProps> = ({
  block,
  depth = 0,
  className,
  components,
  ...props
}) => {
  return (
    <div
      {...props}
      className={`notion-selectable notion-text-block ${className || ""}`.trim()}
      data-block-id={block.id}
    >
      {block.paragraph?.rich_text && (
        <div className="notranslate">
          <RichTextRenderer richText={block.paragraph?.rich_text || []} />
        </div>
      )}

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
