export { BlockRenderer } from "./components/BlockRenderer";

// Export individual block components for composition
export { ParagraphBlockRenderer } from "./components/blocks/ParagraphBlockRenderer";
export { HeadingBlockRenderer } from "./components/blocks/HeadingBlockRenderer";
export { ListItemBlockRenderer } from "./components/blocks/ListItemBlockRenderer";

export { CodeBlockRenderer } from "./components/blocks/CodeBlockRenderer";
export { ImageBlockRenderer } from "./components/blocks/ImageBlockRenderer";
export { TableBlockRenderer } from "./components/blocks/TableBlockRenderer";
export { JsonDocRenderer } from "./JsonDocRenderer";
export { QuoteBlockRenderer } from "./components/blocks/QuoteBlockRenderer";
export { DividerBlockRenderer } from "./components/blocks/DividerBlockRenderer";
export { ToDoBlockRenderer } from "./components/blocks/ToDoBlockRenderer";
export { ToggleBlockRenderer } from "./components/blocks/ToggleBlockRenderer";
export { ColumnListBlockRenderer } from "./components/blocks/ColumnListBlockRenderer";
export { EquationBlockRenderer } from "./components/blocks/EquationBlockRenderer";

// Export context
export { RendererProvider, useRenderer } from "./context";

// Export types
export type { BlockComponents } from "./components/BlockRenderer";
export type { JsonDocRendererProps, BlockRendererProps } from "./types";

// Import default styles - users can override by importing their own after this
import "./styles/index.css";
