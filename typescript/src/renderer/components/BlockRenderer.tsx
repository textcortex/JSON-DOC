import React from "react";
import { ParagraphBlockRenderer } from "./blocks/ParagraphBlockRenderer";
import { HeadingBlockRenderer } from "./blocks/HeadingBlockRenderer";
import { ListItemBlockRenderer } from "./blocks/ListItemBlockRenderer";
import { CodeBlockRenderer } from "./blocks/CodeBlockRenderer";
import { ImageBlockRenderer } from "./blocks/ImageBlockRenderer";
import { TableBlockRenderer } from "./blocks/TableBlockRenderer";
import { QuoteBlockRenderer } from "./blocks/QuoteBlockRenderer";
import { DividerBlockRenderer } from "./blocks/DividerBlockRenderer";
import { ToDoBlockRenderer } from "./blocks/ToDoBlockRenderer";
import { ToggleBlockRenderer } from "./blocks/ToggleBlockRenderer";
import { ColumnListBlockRenderer } from "./blocks/ColumnListBlockRenderer";
import { EquationBlockRenderer } from "./blocks/EquationBlockRenderer";

interface BlockRendererProps {
  block: any;
  depth?: number;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  depth = 0,
}) => {
  const commonProps = { block, depth };

  // Paragraph block
  if (block?.type === "paragraph") {
    return <ParagraphBlockRenderer {...commonProps} />;
  }

  // Heading blocks
  if (block?.type === "heading_1") {
    return <HeadingBlockRenderer {...commonProps} level={1} />;
  }
  if (block?.type === "heading_2") {
    return <HeadingBlockRenderer {...commonProps} level={2} />;
  }
  if (block?.type === "heading_3") {
    return <HeadingBlockRenderer {...commonProps} level={3} />;
  }

  // List blocks
  if (block?.type === "bulleted_list_item") {
    return <ListItemBlockRenderer {...commonProps} type="bulleted" />;
  }
  if (block?.type === "numbered_list_item") {
    return <ListItemBlockRenderer {...commonProps} type="numbered" />;
  }

  // Code block
  if (block?.type === "code") {
    return <CodeBlockRenderer {...commonProps} />;
  }

  // Image block
  if (block?.type === "image") {
    return <ImageBlockRenderer {...commonProps} />;
  }

  // Table blocks
  if (block?.type === "table") {
    return <TableBlockRenderer {...commonProps} />;
  }

  // Quote block
  if (block?.type === "quote") {
    return <QuoteBlockRenderer {...commonProps} />;
  }

  // Divider block
  if (block?.type === "divider") {
    return <DividerBlockRenderer {...commonProps} />;
  }

  // To-do block
  if (block?.type === "to_do") {
    return <ToDoBlockRenderer {...commonProps} />;
  }

  // Toggle block
  if (block?.type === "toggle") {
    return <ToggleBlockRenderer {...commonProps} />;
  }

  // Column list and column blocks
  if (block?.type === "column_list") {
    return <ColumnListBlockRenderer {...commonProps} />;
  }

  // Equation block
  if (block?.type === "equation") {
    return <EquationBlockRenderer {...commonProps} />;
  }

  // Fallback for unsupported block types
  console.warn("Unsupported block type:", block?.type);
  return (
    <div className="notion-unsupported-block" data-block-type={block?.type}>
      <span>Unsupported block type: {block?.type}</span>
    </div>
  );
};
