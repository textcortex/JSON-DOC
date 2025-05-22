/**
 * JSON-DOC TypeScript implementation
 */

// Export all type definitions from generated.ts
export * from "./models/generated";

// Export loader/serializer functions
export {
  loadJsonDoc,
  loadPage,
  loadBlock,
  loadRichText,
  loadImage,
  jsonDocDumpJson,
} from "./serialization/loader";

// Export validation functions
export {
  validateAgainstSchema,
  loadSchema,
  registerSchema,
  ValidationError,
} from "./validation/validator";

// Export utility functions
export {
  loadJson,
  getNestedValue,
  setNestedValue,
  deepClone,
} from "./utils/json";
