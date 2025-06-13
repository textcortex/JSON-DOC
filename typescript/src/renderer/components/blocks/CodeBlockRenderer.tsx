import React from "react";

import { CodeBlock } from "@/models/generated";

import { RichTextRenderer } from "../RichTextRenderer";

interface CodeBlockRendererProps extends React.HTMLAttributes<HTMLDivElement> {
  block: CodeBlock;
}

export const CodeBlockRenderer: React.FC<CodeBlockRendererProps> = ({
  block,
  className,
  ...props
}) => {
  const codeData = block.code;

  return (
    <div
      {...props}
      className={`notion-selectable notion-code-block ${className || ""}`.trim()}
      data-block-id={block.id}
    >
      <div>
        <div role="figure">
          <div className="notion-code-block-language">
            {codeData?.language || "Plain Text"}
          </div>
          <div>
            <div className="line-numbers notion-code-block-content">
              <div className="notranslate">
                <RichTextRenderer richText={codeData?.rich_text || []} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* code block can't have children */}
    </div>
  );
};
