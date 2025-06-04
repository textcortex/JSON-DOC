import React from "react";
import { RichTextRenderer } from "../RichTextRenderer";
import { BlockRenderer } from "../BlockRenderer";

interface HeadingBlockRendererProps {
  block: any;
  level: 1 | 2 | 3;
  depth?: number;
}

export const HeadingBlockRenderer: React.FC<HeadingBlockRendererProps> = ({
  block,
  level,
  depth = 0,
}) => {
  const getHeadingData = () => {
    switch (level) {
      case 1:
        return block.heading_1;
      case 2:
        return block.heading_2;
      case 3:
        return block.heading_3;
      default:
        return null;
    }
  };

  const headingData = getHeadingData();
  const blockClassName =
    level === 1 ? "notion-header-block" : "notion-sub_header-block";

  const renderHeading = () => {
    const content = <RichTextRenderer richText={headingData?.rich_text || []} />;
    switch (level) {
      case 1:
        return <h2 className="notranslate">{content}</h2>;
      case 2:
        return <h3 className="notranslate">{content}</h3>;
      case 3:
        return <h4 className="notranslate">{content}</h4>;
      default:
        return <h2 className="notranslate">{content}</h2>;
    }
  };

  return (
    <div className={`notion-selectable ${blockClassName}`} data-block-id={block.id}>
      <div>{renderHeading()}</div>

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
