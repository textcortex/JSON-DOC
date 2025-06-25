import React from "react";

import {
  Block,
  Heading1Block,
  Heading2Block,
  Heading3Block,
  ParagraphBlock,
  BulletedListItemBlock,
  NumberedListItemBlock,
  CodeBlock,
  ImageBlock,
  TableBlock,
  QuoteBlock,
  DividerBlock,
  ToDoBlock,
  ToggleBlock,
  ColumnListBlock,
  EquationBlock,
} from "@/models/generated";

import { useRenderer } from "../context/RendererContext";

import { DevWrapper } from "./dev/DevWrapper";
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
  block: Block;
  depth?: number;
  components?: BlockComponents;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  depth = 0,
  components,
}) => {
  const { devMode = false } = useRenderer();
  const commonProps = { block, depth, components };

  // Helper function to wrap component with DevWrapper if devMode is enabled
  const wrapWithDev = (component: React.ReactElement) => {
    if (devMode) {
      return <DevWrapper block={block}>{component}</DevWrapper>;
    }
    return component;
  };

  // Paragraph block
  if (block?.type === "paragraph") {
    const ParagraphComponent = components?.paragraph || ParagraphBlockRenderer;
    return wrapWithDev(
      <ParagraphComponent {...commonProps} block={block as ParagraphBlock} />
    );
  }

  // Heading blocks
  if (
    block?.type === "heading_1" ||
    block?.type === "heading_2" ||
    block?.type === "heading_3"
  ) {
    const HeadingComponent = components?.heading_1 || HeadingBlockRenderer;
    return wrapWithDev(
      <HeadingComponent
        {...commonProps}
        block={block as Heading1Block | Heading2Block | Heading3Block}
      />
    );
  }
  // if (block?.type === "heading_2") {
  //   const HeadingComponent = components?.heading_2 || HeadingBlockRenderer;
  //   return wrapWithDev(<HeadingComponent {...commonProps} level={2} />);
  // }
  // if (block?.type === "heading_3") {
  //   const HeadingComponent = components?.heading_3 || HeadingBlockRenderer;
  //   return wrapWithDev(<HeadingComponent {...commonProps} level={3} />);
  // }

  // List item blocks
  if (block?.type === "bulleted_list_item") {
    const BulletedListItemComponent =
      components?.bulleted_list_item || ListItemBlockRenderer;
    return wrapWithDev(
      <BulletedListItemComponent
        {...commonProps}
        block={block as BulletedListItemBlock}
      />
    );
  }
  if (block?.type === "numbered_list_item") {
    const NumberedListItemComponent =
      components?.numbered_list_item || ListItemBlockRenderer;
    return wrapWithDev(
      <NumberedListItemComponent
        {...commonProps}
        block={block as NumberedListItemBlock}
      />
    );
  }

  // Code block
  if (block?.type === "code") {
    const CodeComponent = components?.code || CodeBlockRenderer;
    return wrapWithDev(
      <CodeComponent {...commonProps} block={block as CodeBlock} />
    );
  }

  // Image block
  if (block?.type === "image") {
    const ImageComponent = components?.image || ImageBlockRenderer;
    return wrapWithDev(
      <ImageComponent {...commonProps} block={block as ImageBlock} />
    );
  }

  // Table blocks
  if (block?.type === "table") {
    const TableComponent = components?.table || TableBlockRenderer;
    return wrapWithDev(
      <TableComponent {...commonProps} block={block as TableBlock} />
    );
  }

  // Quote block
  if (block?.type === "quote") {
    const QuoteComponent = components?.quote || QuoteBlockRenderer;
    return wrapWithDev(
      <QuoteComponent {...commonProps} block={block as QuoteBlock} />
    );
  }

  // Divider block
  if (block?.type === "divider") {
    const DividerComponent = components?.divider || DividerBlockRenderer;
    return wrapWithDev(
      <DividerComponent {...commonProps} block={block as DividerBlock} />
    );
  }

  // To-do block
  if (block?.type === "to_do") {
    const ToDoComponent = components?.to_do || ToDoBlockRenderer;
    return wrapWithDev(
      <ToDoComponent {...commonProps} block={block as ToDoBlock} />
    );
  }

  // Toggle block
  if (block?.type === "toggle") {
    const ToggleComponent = components?.toggle || ToggleBlockRenderer;
    return wrapWithDev(
      <ToggleComponent {...commonProps} block={block as ToggleBlock} />
    );
  }

  // Column list and column blocks
  if (block?.type === "column_list") {
    const ColumnListComponent =
      components?.column_list || ColumnListBlockRenderer;
    return wrapWithDev(
      <ColumnListComponent {...commonProps} block={block as ColumnListBlock} />
    );
  }

  // Equation block
  if (block?.type === "equation") {
    const EquationComponent = components?.equation || EquationBlockRenderer;
    return wrapWithDev(
      <EquationComponent {...commonProps} block={block as EquationBlock} />
    );
  }

  // Fallback for unsupported block types
  console.warn("Unsupported block type:", block?.type);
  return (
    <div
      className="notion-unsupported-block"
      data-block-type={block?.type}
      role="alert"
    >
      <span>Error Unsupported block type: {block?.type}</span>
    </div>
  );
};
