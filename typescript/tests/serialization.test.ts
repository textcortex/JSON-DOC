import * as fs from "fs";
import * as path from "path";
import * as JSON5 from "json5";
import { loadJson, deepClone } from "../src";

// Path to the example page JSON file
const PAGE_PATH = path.resolve(__dirname, "../../schema/page/ex1_success.json");

describe("JSON-DOC Utilities", () => {
  // Helper function to load a JSON file with comment handling
  function loadJsonFile(filePath: string): any {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      // Use JSON5 to handle comments
      return JSON5.parse(content);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return {};
    }
  }

  test("should load JSON correctly", () => {
    const testData = { hello: "world", nested: { value: 42 } };
    const jsonString = JSON.stringify(testData);
    
    // Test loading from string
    const loaded = loadJson(jsonString);
    expect(loaded).toEqual(testData);
    
    // Test loading from object
    const loadedObj = loadJson(testData);
    expect(loadedObj).toEqual(testData);
  });

  test("should deep clone objects", () => {
    const original = { 
      hello: "world", 
      nested: { value: 42, array: [1, 2, 3] },
      nullValue: null
    };
    
    const cloned = deepClone(original);
    
    // Should be equal but not the same reference
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.nested).not.toBe(original.nested);
    expect(cloned.nested.array).not.toBe(original.nested.array);
    
    // Modifying clone shouldn't affect original
    cloned.nested.value = 99;
    expect(original.nested.value).toBe(42);
  });

  test("should load example page from schema", () => {
    // Load the example page from the schema
    const content = loadJsonFile(PAGE_PATH);

    // Ensure the page was loaded
    expect(content).not.toBeNull();
    expect(content.object).toBe("page");
    expect(content.id).toBeTruthy();
    expect(content.children).toBeDefined();
    expect(Array.isArray(content.children)).toBe(true);
    
    // Check that it has various block types
    const blockTypes = new Set();
    const collectBlockTypes = (blocks: any[]) => {
      blocks?.forEach((block: any) => {
        if (block.type) blockTypes.add(block.type);
        if (block.children) collectBlockTypes(block.children);
      });
    };
    collectBlockTypes(content.children);
    
    // Should have multiple block types
    expect(blockTypes.size).toBeGreaterThan(5);
    expect(blockTypes.has("paragraph")).toBe(true);
    expect(blockTypes.has("heading_1")).toBe(true);
  });
});
