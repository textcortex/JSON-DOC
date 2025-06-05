import Ajv, { ErrorObject } from "ajv";
import addFormats from "ajv-formats";

import { deepClone } from "../utils/json";

// Initialize AJV
const ajv = new Ajv({
  allErrors: true,
  strict: false,
  strictTypes: false,
  strictTuples: false,
});

// Add formats
addFormats(ajv);

// Cache compiled validators
const validatorCache: Record<string, ReturnType<typeof ajv.compile>> = {};

/**
 * ValidationError class for JSON-DOC validation errors
 */
export class ValidationError extends Error {
  public errors: ErrorObject[];

  constructor(message: string, errors: ErrorObject[]) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

/**
 * Load a JSON schema from a file or URL
 * @param schemaPath Path to the schema file
 * @returns Loaded schema
 */
export async function loadSchema(schemaPath: string): Promise<any> {
  try {
    const schemaResponse = await fetch(schemaPath);

    if (!schemaResponse.ok) {
      throw new Error(`Failed to load schema: ${schemaResponse.statusText}`);
    }

    return await schemaResponse.json();
  } catch (error) {
    throw new Error(`Error loading schema ${schemaPath}: ${error}`);
  }
}

/**
 * Validate data against a JSON schema
 * @param data Data to validate
 * @param schema JSON schema to validate against
 * @returns Validation result (true if valid)
 * @throws ValidationError if validation fails
 */
export function validateAgainstSchema(data: any, schema: any): boolean {
  // Create a unique key for the schema
  const schemaKey = JSON.stringify(schema);

  // Get or create a validator
  if (!validatorCache[schemaKey]) {
    validatorCache[schemaKey] = ajv.compile(schema);
  }

  const validate = validatorCache[schemaKey];

  // Validate the data
  const isValid = validate(deepClone(data));

  if (!isValid && validate.errors) {
    throw new ValidationError("Validation failed", validate.errors);
  }

  return true;
}

/**
 * Register a schema with AJV
 * @param schema Schema to register
 * @param id Schema ID
 */
export function registerSchema(schema: any, id: string): void {
  if (!schema.$id) {
    schema = { ...schema, $id: id };
  }
  ajv.addSchema(schema, id);
}
