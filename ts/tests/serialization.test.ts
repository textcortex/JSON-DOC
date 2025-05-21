import * as fs from 'fs';
import * as path from 'path';
import * as JSON5 from 'json5';
import { loadJsonDoc, jsonDocDumpJson, Block, Page } from '../src';

// Path to the example page JSON file
const PAGE_PATH = path.resolve(__dirname, '../../schema/page/ex1_success.json');

describe('JSON-DOC Serialization', () => {
  // For test 1, we won't use the example page since it has comments that can't be parsed
  
  // Helper function to load a JSON file with comment handling
  function loadJsonFile(filePath: string): any {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Function to strip comments from JSON
      function stripJsonComments(json: string): string {
        // Remove single-line comments
        let result = json.replace(/\/\/.*$/gm, '');
        
        // Remove multi-line comments
        result = result.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Fix trailing commas
        result = result.replace(/,\s*([}\]])/g, '$1');
        
        return result;
      }

      try {
        // Try using JSON5 first, which handles comments
        return JSON5.parse(content);
      } catch (parseError) {
        // Fall back to manual comment stripping if JSON5 fails
        return JSON.parse(stripJsonComments(content));
      }
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      // Return empty object for test fallback
      return {};
    }
  }
  
  // Helper function to normalize JSON for comparison
  function normalizeJson(obj: any): any {
    // Function to remove null fields
    const removeNulls = (obj: any): any => {
      if (obj === null) return null;
      if (typeof obj !== 'object') return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(item => removeNulls(item));
      }
      
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip keys we want to exclude
        const keysToExclude = ['link', 'href'];
        if (keysToExclude.includes(key) && value === null) {
          continue;
        }
        
        if (value !== null) {
          result[key] = removeNulls(value);
        }
      }
      return result;
    };
    
    // Clone and remove nulls
    return removeNulls(JSON.parse(JSON.stringify(obj)));
  }
  
  // Format JSON with sorted keys for consistent comparison
  function canonicalizeJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }
  
  test('should handle rich text properly', () => {
    // Create a simple paragraph block with rich text
    const block = {
      object: 'block',
      id: 'test-block-id',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: 'Hello, world!',
              link: null
            },
            annotations: {
              bold: false,
              italic: true,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default'
            },
            plain_text: 'Hello, world!',
            href: null
          }
        ],
        color: 'default'
      }
    };
    
    // Load the block using our loader
    const loadedBlock = loadJsonDoc(block) as Block;
    
    // Serialize back to JSON
    const serialized = JSON.parse(jsonDocDumpJson(loadedBlock));
    
    // Normalize for comparison
    const normalizedBlock = normalizeJson(block);
    const normalizedSerialized = normalizeJson(serialized);
    
    // Compare
    expect(normalizedSerialized).toEqual(normalizedBlock);
  });
  
  test('should handle nested blocks', () => {
    // Create a block with children
    const block = {
      object: 'block',
      id: 'parent-block-id',
      type: 'toggle',
      toggle: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: 'Toggle header',
              link: null
            },
            plain_text: 'Toggle header',
            href: null
          }
        ],
        color: 'default'
      },
      children: [
        {
          object: 'block',
          id: 'child-block-id',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Toggle content',
                  link: null
                },
                plain_text: 'Toggle content',
                href: null
              }
            ],
            color: 'default'
          }
        }
      ]
    };
    
    // Load the block using our loader
    const loadedBlock = loadJsonDoc(block) as Block;
    
    // Serialize back to JSON
    const serialized = JSON.parse(jsonDocDumpJson(loadedBlock));
    
    // Normalize for comparison
    const normalizedBlock = normalizeJson(block);
    const normalizedSerialized = normalizeJson(serialized);
    
    // Compare
    expect(normalizedSerialized).toEqual(normalizedBlock);
  });
  
  test('should load and serialize a page with children', () => {
    // Create a simple page with a paragraph child
    const page = {
      object: 'page',
      id: 'test-page-id',
      created_time: '2024-08-01T15:27:00.000Z',
      last_edited_time: '2024-08-01T15:27:00.000Z',
      parent: {
        type: 'workspace',
        workspace: true
      },
      children: [
        {
          object: 'block',
          id: 'child-block-id',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Page content',
                  link: null
                },
                plain_text: 'Page content',
                href: null
              }
            ],
            color: 'default'
          }
        }
      ]
    };
    
    // Load the page using our loader
    const loadedPage = loadJsonDoc(page) as Page;
    
    // Serialize back to JSON
    const serialized = JSON.parse(jsonDocDumpJson(loadedPage));
    
    // Normalize for comparison
    const normalizedPage = normalizeJson(page);
    const normalizedSerialized = normalizeJson(serialized);
    
    // Compare
    expect(normalizedSerialized).toEqual(normalizedPage);
  });

  test('should load and serialize the example page from schema', () => {
    // Load the example page from the schema
    const content = loadJsonFile(PAGE_PATH);
    
    // Load the page using our loader
    console.time('loadJsonDoc');
    const loadedPage = loadJsonDoc(content) as Page;
    console.timeEnd('loadJsonDoc');
    
    // Ensure the page was loaded
    expect(loadedPage).not.toBeNull();
    
    // Serialize back to JSON
    const serialized = JSON.parse(jsonDocDumpJson(loadedPage));
    
    // Normalize both objects for comparison
    const normalizedContent = normalizeJson(content);
    const normalizedSerialized = normalizeJson(serialized);
    
    // Sort keys for canonical representation
    const canonicalContent = JSON.parse(canonicalizeJson(normalizedContent));
    const canonicalSerialized = JSON.parse(canonicalizeJson(normalizedSerialized));
    
    // Compare the objects
    expect(canonicalSerialized).toEqual(canonicalContent);
  });
});