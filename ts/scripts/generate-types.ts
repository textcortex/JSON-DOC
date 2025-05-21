import * as fs from 'fs';
import * as path from 'path';
import { compile, JSONSchema } from 'json-schema-to-typescript';
import * as util from 'util';
import * as JSON5 from 'json5';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

// Configuration
const SCHEMA_DIR = path.resolve(__dirname, '../../schema');
const OUTPUT_DIR = path.resolve(__dirname, '../src/models/generated');
const SCHEMA_SUFFIX = '_schema.json';
const EXAMPLE_FILE_SUFFIX = 'ex1_success.json';

// Cache loaded schemas to avoid duplicate file reads
const schemaCache: Record<string, any> = {};

/**
 * Load a JSON schema file with comment handling using JSON5
 */
async function loadJsonFile(filePath: string): Promise<any> {
  if (schemaCache[filePath]) {
    return schemaCache[filePath];
  }

  try {
    const content = await readFile(filePath, 'utf8');
    
    try {
      // Use JSON5 to parse the content with comments and trailing commas
      const parsed = JSON5.parse(content);
      
      // Validate that we have a valid schema object
      if (parsed && typeof parsed === 'object' && 
          (parsed.title || parsed.$schema || parsed.type)) {
        schemaCache[filePath] = parsed;
        return parsed;
      } else {
        console.error(`Invalid schema format in ${filePath}`);
        return {};
      }
    } catch (parseError) {
      console.error(`Error parsing JSON from ${filePath}:`, parseError);
      console.error(parseError);
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
 * Resolve $ref references in schema
 */
async function resolveRefs(obj: any, sourceDir: string): Promise<any> {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => resolveRefs(item, sourceDir)));
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === '$ref' && typeof value === 'string') {
      let ref = value as string;
      
      // Handle absolute references starting with /
      if (ref.startsWith('/')) {
        ref = ref.substring(1);
      }

      // Handle fragments
      let fragment: string | null = null;
      if (ref.includes('#')) {
        const tokens = ref.split('#');
        ref = tokens[0];
        fragment = tokens[1];
      }

      try {
        const refPath = path.resolve(path.join(sourceDir, ref));
        let refObj = await loadJsonFile(refPath);

        if (fragment) {
          // Navigate through the fragment path
          const parts = fragment.split('/').filter(Boolean);
          for (const part of parts) {
            if (refObj && typeof refObj === 'object' && part in refObj) {
              refObj = refObj[part];
            } else {
              console.warn(`Fragment part '${part}' not found in referenced object`);
              refObj = {};
              break;
            }
          }
        }

        // Get title for the type
        const title = refObj.title;
        if (!title) {
          console.warn(`Title not found in ${refPath}, using fallback`);
          // Just return the referenced object
          return refObj || {};
        }

        // Handle custom type path similar to Python implementation
        let customTypePath;
        if (refObj.customTypePath) {
          customTypePath = refObj.customTypePath;
        } else {
          const refTokens = ref.split('/');
          // Remove the filename
          refTokens.pop();
          customTypePath = [...refTokens, title].join('.');
        }

        // Create a simplified reference object
        return {
          type: 'object',
          title,
          properties: {},
          additionalProperties: false,
          // Add metadata for TypeScript generator
          // These will be processed by json-schema-to-typescript
          description: `Reference to ${customTypePath}`,
          tsType: customTypePath.split('.').pop(),
        };
      } catch (error) {
        console.error(`Error resolving reference ${ref}:`, error);
        return {};
      }
    }

    result[key] = await resolveRefs(value, sourceDir);
  }

  return result;
}

/**
 * Convert a JSON schema to TypeScript interface
 * @param schemaPath Path to the schema file
 * @param sourceDir Directory containing all schemas (for resolving references)
 * @param outputPath Path to write the TypeScript interface to
 */
async function convertSchemaToTypeScript(
  schemaPath: string,
  sourceDir: string,
  outputPath: string
): Promise<void> {
  try {
    // Load the schema
    let schema = await loadJsonFile(schemaPath);
    if (!schema || Object.keys(schema).length === 0) {
      console.warn(`Empty or invalid schema at ${schemaPath}, skipping`);
      return;
    }

    // Resolve references multiple times to handle nested references
    for (let i = 0; i < 4; i++) {
      schema = await resolveRefs(schema, sourceDir);
    }

    // Extract the filename and use it for interface naming
    const fileName = path.basename(schemaPath, SCHEMA_SUFFIX);
    const interfaceName = fileName
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    // Generate TypeScript interface
    const typeScript = await compile(schema, interfaceName, {
      bannerComment: '',
      style: {
        printWidth: 100,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
      },
      additionalProperties: false,
    });

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await mkdir(outputDir, { recursive: true });

    // Write the TypeScript interface to file
    await writeFile(outputPath, typeScript);
    console.log(`Generated: ${outputPath}`);
  } catch (error) {
    console.error(`Error converting schema ${schemaPath}:`, error);
  }
}

/**
 * Create a TypeScript enum from a string enum schema
 */
async function createEnum(name: string, schema: any): Promise<string> {
  if (!schema.enum || !Array.isArray(schema.enum)) {
    return '';
  }

  const enumValues = schema.enum.map((value: string) => `  ${value} = '${value}',`).join('\n');
  return `export enum ${name} {\n${enumValues}\n}\n`;
}

/**
 * Create type guard functions for discriminated unions
 */
async function createTypeGuards(types: string[]): Promise<string> {
  const typeGuards = types.map(type => 
    `export function is${type}(obj: any): obj is ${type} {
  return obj && obj.type === '${type.toLowerCase()}';
}\n`
  ).join('\n');
  
  return typeGuards;
}

/**
 * Create barrel files (index.ts) for easier imports
 */
function createBarrelFiles(dir: string): void {
  if (!fs.existsSync(dir)) return;

  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  // Get directories
  const directories = items
    .filter(item => item.isDirectory())
    .map(item => item.name);
  
  // Get TypeScript files (excluding index.ts)
  const typeScriptFiles = items
    .filter(item => item.isFile() && item.name.endsWith('.ts') && item.name !== 'index.ts')
    .map(item => path.basename(item.name, '.ts'));

  // Create index.ts with exports
  const exports = [
    ...directories.map(dir => `export * from './${dir}';`),
    ...typeScriptFiles.map(file => `export * from './${file}';`),
  ];

  if (exports.length > 0) {
    fs.writeFileSync(path.join(dir, 'index.ts'), exports.join('\n') + '\n');
    console.log(`Created barrel file: ${path.join(dir, 'index.ts')}`);
  }

  // Process subdirectories recursively
  for (const subDir of directories) {
    createBarrelFiles(path.join(dir, subDir));
  }
}

/**
 * Generate essential enums and interfaces that are needed for type references
 */
async function generateEssentialTypes(outputDir: string): Promise<void> {
  // Define essential enums
  const essentialTypesDef = `
// Object types
export enum ObjectType {
  Page = 'page',
  Block = 'block',
  User = 'user',
}

// Block types
export enum BlockType {
  Paragraph = 'paragraph',
  ToDo = 'to_do',
  BulletedListItem = 'bulleted_list_item',
  NumberedListItem = 'numbered_list_item',
  Code = 'code',
  Column = 'column',
  ColumnList = 'column_list',
  Divider = 'divider',
  Equation = 'equation',
  Heading1 = 'heading_1',
  Heading2 = 'heading_2',
  Heading3 = 'heading_3',
  Image = 'image',
  Quote = 'quote',
  Table = 'table',
  TableRow = 'table_row',
  Toggle = 'toggle',
}

// Rich text types
export enum RichTextType {
  Text = 'text',
  Equation = 'equation',
}

// File types
export enum FileType {
  File = 'file',
  External = 'external',
}

// Parent types
export enum ParentType {
  DatabaseId = 'database_id',
  PageId = 'page_id',
  Workspace = 'workspace',
  BlockId = 'block_id',
}

// Base types
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject { [key: string]: JsonValue }
export type JsonArray = JsonValue[];

// Type guards
export function isPage(obj: any): obj is any {
  return obj && obj.object === ObjectType.Page;
}

export function isBlock(obj: any): obj is any {
  return obj && obj.object === ObjectType.Block;
}

export function isRichTextText(obj: any): obj is any {
  return obj && obj.type === RichTextType.Text;
}

export function isRichTextEquation(obj: any): obj is any {
  return obj && obj.type === RichTextType.Equation;
}

export function isExternalFile(obj: any): obj is any {
  return obj && obj.type === FileType.External;
}

export function isFileFile(obj: any): obj is any {
  return obj && obj.type === FileType.File;
}
`;

  // Write the essential types to a file
  const essentialTypesPath = path.join(outputDir, 'essential-types.ts');
  await writeFile(essentialTypesPath, essentialTypesDef);
  console.log(`Generated essential types at ${essentialTypesPath}`);
}

/**
 * Process all schema files and create TypeScript interfaces
 */
async function createTypeScriptModels(sourceDir: string, destinationDir: string): Promise<void> {
  console.log(`Source directory: ${sourceDir}`);
  console.log(`Destination directory: ${destinationDir}`);

  // Check if source directory exists
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory ${sourceDir} does not exist`);
  }

  // Clear destination directory if it exists
  if (fs.existsSync(destinationDir)) {
    fs.rmSync(destinationDir, { recursive: true, force: true });
  }
  
  // Create destination directory
  await mkdir(destinationDir, { recursive: true });

  // Generate essential types first
  await generateEssentialTypes(destinationDir);

  // Process schema files
  const processDir = async (currentDir: string, relativePath: string = '') => {
    console.log(`Processing directory: ${currentDir}, relative path: ${relativePath}`);
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    // Process all subdirectories first
    for (const item of items) {
      if (item.isDirectory()) {
        const sourceSubDir = path.join(currentDir, item.name);
        const relativeSubPath = path.join(relativePath, item.name);
        await processDir(sourceSubDir, relativeSubPath);
      }
    }

    // Process schema files
    for (const item of items) {
      if (item.isFile() && item.name.endsWith(SCHEMA_SUFFIX)) {
        const sourceFile = path.join(currentDir, item.name);
        const destSubDir = path.join(destinationDir, relativePath);
        
        // Create output file name (replacing _schema.json with .ts)
        const baseName = path.basename(item.name, SCHEMA_SUFFIX);
        const destFile = path.join(destSubDir, `${baseName}.ts`);
        
        await convertSchemaToTypeScript(sourceFile, sourceDir, destFile);
      }
    }
  };

  await processDir(sourceDir);
  
  // Create barrel files for easier imports
  createBarrelFiles(destinationDir);
  
  // Create the main index.ts file at the root of models
  const rootIndex = path.join(destinationDir, 'index.ts');
  const rootDirs = fs.readdirSync(destinationDir, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => `export * from './${item.name}';`);
  
  const rootFiles = fs.readdirSync(destinationDir, { withFileTypes: true })
    .filter(item => item.isFile() && item.name.endsWith('.ts') && item.name !== 'index.ts')
    .map(item => `export * from './${path.basename(item.name, '.ts')}';`);
  
  fs.writeFileSync(rootIndex, [...rootDirs, ...rootFiles].join('\n') + '\n');
  console.log(`Created root barrel file: ${rootIndex}`);
}

// Execute the script
(async () => {
  try {
    await createTypeScriptModels(SCHEMA_DIR, OUTPUT_DIR);
    console.log('TypeScript models generation completed successfully');
  } catch (error) {
    console.error('Error generating TypeScript models:', error);
    process.exit(1);
  }
})();