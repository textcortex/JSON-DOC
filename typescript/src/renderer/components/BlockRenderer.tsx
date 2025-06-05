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
import { UnorderedListBlockRenderer } from "./blocks/UnorderedListBlockRenderer";
import { OrderedListBlockRenderer } from "./blocks/OrderedListBlockRenderer";

// Component override types for all block types
export type BlockComponents = {
  paragraph?: React.ComponentType<
    React.ComponentProps<typeof ParagraphBlockRenderer>
  >;
  heading_1?: React.ComponentType<
    React.ComponentProps<typeof HeadingBlockRenderer>
  >;
  heading_2?: React.ComponentType<
    React.ComponentProps<typeof HeadingBlockRenderer>
  >;
  heading_3?: React.ComponentType<
    React.ComponentProps<typeof HeadingBlockRenderer>
  >;
  bulleted_list_item?: React.ComponentType<
    React.ComponentProps<typeof ListItemBlockRenderer>
  >;
  numbered_list_item?: React.ComponentType<
    React.ComponentProps<typeof ListItemBlockRenderer>
  >;
  unordered_list?: React.ComponentType<
    React.ComponentProps<typeof UnorderedListBlockRenderer>
  >;
  ordered_list?: React.ComponentType<
    React.ComponentProps<typeof OrderedListBlockRenderer>
  >;
  code?: React.ComponentType<React.ComponentProps<typeof CodeBlockRenderer>>;
  image?: React.ComponentType<React.ComponentProps<typeof ImageBlockRenderer>>;
  table?: React.ComponentType<React.ComponentProps<typeof TableBlockRenderer>>;
  quote?: React.ComponentType<React.ComponentProps<typeof QuoteBlockRenderer>>;
  divider?: React.ComponentType<
    React.ComponentProps<typeof DividerBlockRenderer>
  >;
  to_do?: React.ComponentType<React.ComponentProps<typeof ToDoBlockRenderer>>;
  toggle?: React.ComponentType<
    React.ComponentProps<typeof ToggleBlockRenderer>
  >;
  column_list?: React.ComponentType<
    React.ComponentProps<typeof ColumnListBlockRenderer>
  >;
  equation?: React.ComponentType<
    React.ComponentProps<typeof EquationBlockRenderer>
  >;
};

interface BlockRendererProps {
  block: any;
  depth?: number;
  components?: BlockComponents;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  depth = 0,
  components,
}) => {
  const commonProps = { block, depth, components };

  // Paragraph block
  if (block?.type === "paragraph") {
    const ParagraphComponent = components?.paragraph || ParagraphBlockRenderer;
    return <ParagraphComponent {...commonProps} />;
  }

  // Heading blocks
  if (block?.type === "heading_1") {
    const HeadingComponent = components?.heading_1 || HeadingBlockRenderer;
    return <HeadingComponent {...commonProps} level={1} />;
  }
  if (block?.type === "heading_2") {
    const HeadingComponent = components?.heading_2 || HeadingBlockRenderer;
    return <HeadingComponent {...commonProps} level={2} />;
  }
  if (block?.type === "heading_3") {
    const HeadingComponent = components?.heading_3 || HeadingBlockRenderer;
    return <HeadingComponent {...commonProps} level={3} />;
  }

  // List container blocks
  if (block?.type === "unordered_list") {
    const UnorderedListComponent =
      components?.unordered_list || UnorderedListBlockRenderer;
    return <UnorderedListComponent {...commonProps} />;
  }
  if (block?.type === "ordered_list") {
    const OrderedListComponent =
      components?.ordered_list || OrderedListBlockRenderer;
    return <OrderedListComponent {...commonProps} />;
  }

  // List item blocks
  if (block?.type === "bulleted_list_item") {
    const BulletedListItemComponent =
      components?.bulleted_list_item || ListItemBlockRenderer;
    return <BulletedListItemComponent {...commonProps} type="bulleted" />;
  }
  if (block?.type === "numbered_list_item") {
    const NumberedListItemComponent =
      components?.numbered_list_item || ListItemBlockRenderer;
    return <NumberedListItemComponent {...commonProps} type="numbered" />;
  }

  // Code block
  if (block?.type === "code") {
    const CodeComponent = components?.code || CodeBlockRenderer;
    return <CodeComponent {...commonProps} />;
  }

  // Image block
  if (block?.type === "image") {
    const ImageComponent = components?.image || ImageBlockRenderer;
    return <ImageComponent {...commonProps} />;
  }

  // Table blocks
  if (block?.type === "table") {
    const TableComponent = components?.table || TableBlockRenderer;
    return <TableComponent {...commonProps} />;
  }

  // Quote block
  if (block?.type === "quote") {
    const QuoteComponent = components?.quote || QuoteBlockRenderer;
    return <QuoteComponent {...commonProps} />;
  }

  // Divider block
  if (block?.type === "divider") {
    const DividerComponent = components?.divider || DividerBlockRenderer;
    return <DividerComponent {...commonProps} />;
  }

  // To-do block
  if (block?.type === "to_do") {
    const ToDoComponent = components?.to_do || ToDoBlockRenderer;
    return <ToDoComponent {...commonProps} />;
  }

  // Toggle block
  if (block?.type === "toggle") {
    const ToggleComponent = components?.toggle || ToggleBlockRenderer;
    return <ToggleComponent {...commonProps} />;
  }

  // Column list and column blocks
  if (block?.type === "column_list") {
    const ColumnListComponent =
      components?.column_list || ColumnListBlockRenderer;
    return <ColumnListComponent {...commonProps} />;
  }

  // Equation block
  if (block?.type === "equation") {
    const EquationComponent = components?.equation || EquationBlockRenderer;
    return <EquationComponent {...commonProps} />;
  }

  // Fallback for unsupported block types
  console.warn("Unsupported block type:", block?.type);
  return (
    <div className="notion-unsupported-block" data-block-type={block?.type}>
      <span>Unsupported block type: {block?.type}</span>
    </div>
  );
};
