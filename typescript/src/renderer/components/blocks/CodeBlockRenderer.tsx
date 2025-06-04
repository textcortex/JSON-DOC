import React from "react";

import { RichTextRenderer } from "../RichTextRenderer";
import { BlockRenderer } from "../BlockRenderer";

interface CodeBlockRendererProps {
  block: any;
  depth?: number;
}

export const CodeBlockRenderer: React.FC<CodeBlockRendererProps> = ({
  block,
  depth = 0,
}) => {
  const codeData = block.code;

  return (
    <div
      className="notion-selectable notion-code-block"
      data-block-id={block.id}
    >
      <div>
        <div role="figure">
          <div>
            <div>
              <div>{codeData?.language || "Plain Text"}</div>
            </div>
          </div>
          <div>
            <div className="line-numbers notion-code-block">
              <div className="notranslate">
                <RichTextRenderer richText={codeData?.rich_text || []} />
              </div>
            </div>
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
            />
          ))}
        </div>
      )}
    </div>
  );
};
