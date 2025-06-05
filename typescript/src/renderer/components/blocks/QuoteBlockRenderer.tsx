import React from "react";

import { RichTextRenderer } from "../RichTextRenderer";
import { BlockRenderer } from "../BlockRenderer";

interface QuoteBlockRendererProps extends React.HTMLAttributes<HTMLDivElement> {
  block: any;
  depth?: number;
  components?: React.ComponentProps<typeof BlockRenderer>['components'];
}

export const QuoteBlockRenderer: React.FC<QuoteBlockRendererProps> = ({
  block,
  depth = 0,
  className,
  components,
  ...props
}) => {
  const quoteData = block.quote;

  return (
    <div
      {...props}
      className={`notion-selectable notion-quote-block ${className || ''}`.trim()}
      data-block-id={block.id}
    >
      <blockquote>
        <div>
          <div className="notranslate">
            <RichTextRenderer richText={quoteData?.rich_text || []} />
          </div>
        </div>
      </blockquote>

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
