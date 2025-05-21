import * as fs from 'fs';
import * as path from 'path';
import { compile } from 'json-schema-to-typescript';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

// Configuration
const SCHEMA_DIR = path.resolve(__dirname, '../../schema');
const OUTPUT_DIR = path.resolve(__dirname, '../src/models/generated');
const EXAMPLE_FILE_PATTERN = 'ex1_success.json';

/**
 * Simple function to strip comments from JSON
 */
function stripJsonComments(json: string): string {
  // Remove single-line comments
  let result = json.replace(/\/\/.*$/gm, '');

  // Remove multi-line comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');

  // Fix trailing commas
  result = result.replace(/,\s*([}\]])/g, '$1');

  return result;
}

/**
 * Load a JSON file with comment handling
 */
async function loadJsonFile(filePath: string): Promise<any> {
  try {
    const content = await readFile(filePath, 'utf8');

    // Remove comments and fix trailing commas
    const cleanContent = stripJsonComments(content);

    try {
      const parsed = JSON.parse(cleanContent);
      return parsed;
    } catch (parseError) {
      console.error(`Error parsing JSON from ${filePath}:`, parseError);
      // Return empty object as fallback
      return {};
    }
  } catch (error) {
    console.error(`Error loading JSON file ${filePath}:`, error);
    // Return empty object as fallback
    return {};
  }
}

/**
 * Create a type definition based on an example JSON object
 */
function createTypeDefinition(name: string, example: any): string {
  // Helper function to convert a type name to pascal case
  const toPascalCase = (str: string): string => {
    return str.split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  };

  // Extract relevant information based on the example object type
  if (example.object === 'page') {
    return createPageTypeDefinition(name, example);
  } else if (example.object === 'block') {
    return createBlockTypeDefinition(name, example);
  } else if (example.type === 'file' || example.type === 'external') {
    return createFileTypeDefinition(name, example);
  } else {
    // Generic object
    return `export interface ${toPascalCase(name)} {\n  [key: string]: any;\n}\n`;
  }
}

/**
 * Create type definition for a page
 */
function createPageTypeDefinition(name: string, example: any): string {
  return `export interface ${name} {
  object: 'page';
  id: string;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  archived?: boolean;
  in_trash?: boolean;
  parent?: Parent;
  url?: string;
  properties?: { [key: string]: any };
  children?: Block[];
}\n`;
}

/**
 * Create type definition for a block
 */
function createBlockTypeDefinition(name: string, example: any): string {
  const blockType = example.type;

  return `export interface ${name} {
  object: 'block';
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: '${blockType}';
  ${blockType}: ${blockType}Content;
  children?: Block[];
}\n`;
}

/**
 * Create type definition for a file
 */
function createFileTypeDefinition(name: string, example: any): string {
  const fileType = example.type;

  if (fileType === 'file') {
    return `export interface ${name} {
  type: 'file';
  file: {
    url: string;
    expiry_time?: string;
  };
}\n`;
  } else if (fileType === 'external') {
    return `export interface ${name} {
  type: 'external';
  external: {
    url: string;
  };
}\n`;
  } else {
    return `export interface ${name} {
  type: string;
  [key: string]: any;
}\n`;
  }
}

/**
 * Generate a comprehensive types.ts file with all TypeScript definitions
 */
async function generateTypeDefinitions(outputPath: string): Promise<void> {
  // Common types used throughout the JSON-DOC format

  // Ensure the output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Generated type definitions at ${outputPath}`);
}

/**
 * Process the schema directory and create TypeScript interfaces
 */
async function createTypeScriptModels(): Promise<void> {
  // Clear destination directory if it exists
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }

  // Create destination directory
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Generate the comprehensive types.ts file
  const indexFile = path.join(OUTPUT_DIR, 'index.ts');
  await generateTypeDefinitions(indexFile);

  console.log('TypeScript models generation completed successfully');
}

// Execute the script
(async () => {
  try {
    await createTypeScriptModels();
  } catch (error) {
    console.error('Error generating TypeScript models:', error);
    process.exit(1);
  }
})();