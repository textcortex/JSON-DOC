import React from "react";

import {
  Heading1Block,
  Heading2Block,
  Heading3Block,
} from "@/models/generated";

import { RichTextRenderer } from "../RichTextRenderer";

interface HeadingBlockRendererProps
  extends React.HTMLAttributes<HTMLDivElement> {
  block: Heading1Block | Heading2Block | Heading3Block;
}

export const HeadingBlockRenderer: React.FC<HeadingBlockRendererProps> = ({
  block,
  className,
  ...props
}) => {
  const getHeadingData = () => {
    switch (block.type) {
      case "heading_1":
        return block.heading_1;
      case "heading_2":
        return block.heading_2;
      case "heading_3":
        return block.heading_3;
      default:
        return null;
    }
  };

  const headingData = getHeadingData();
  const blockClassName =
    block.type === "heading_1"
      ? "notion-header-block"
      : "notion-sub_header-block";

  const renderHeading = () => {
    const content = (
      <RichTextRenderer richText={headingData?.rich_text || []} />
    );
    switch (block.type) {
      case "heading_1":
        return <h2 className="notranslate">{content}</h2>;
      case "heading_2":
        return <h3 className="notranslate">{content}</h3>;
      case "heading_3":
        return <h4 className="notranslate">{content}</h4>;
      default:
        return <h2 className="notranslate">{content}</h2>;
    }
  };

  return (
    <div
      {...props}
      className={`notion-selectable ${blockClassName} ${className || ""}`.trim()}
      data-block-id={block.id}
    >
      <div>{renderHeading()}</div>
    </div>
  );
};
