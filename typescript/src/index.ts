/**
 * JSON-DOC TypeScript implementation
 */

// Export utility functions
export {
  loadJson,
  getNestedValue,
  setNestedValue,
  deepClone,
} from "./utils/json";

// Export React renderer components
export { JsonDocRenderer, BlockRenderer } from "./renderer";

export type { JsonDocRendererProps, BlockRendererProps } from "./renderer";
