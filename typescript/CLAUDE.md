# JSON-DOC TypeScript Implementation - Development Notes

## Project Overview

This is a TypeScript implementation of JSON-DOC, which is a JSON schema-based document format similar to Notion's block structure. The implementation programmatically generates TypeScript interfaces from JSON schemas and provides serialization/deserialization functionality.

## Key Requirements and User Instructions

### Primary Requirements

1. **GENERATE TYPES PROGRAMMATICALLY**: All TypeScript interfaces must be generated from JSON schemas - NO hardcoded types allowed
2. **Schema-First Approach**: Similar to Python implementation using datamodel-codegen, TypeScript interfaces are generated from JSON schema files
3. **Full Serialization Support**: Load JSON-DOC objects, process them with proper typing, and serialize back to identical JSON
4. **Test Compatibility**: Implementation must pass comprehensive tests using real example data from schema/page/ex1_success.json

### Critical User Instructions

- **NEVER hardcode enums or types** - everything must be extracted from JSON schemas
- **Use proper libraries** like json-schema-to-typescript for programmatic generation
- **Follow modern TypeScript conventions** with strict typing
- **Ensure tests pass** with the large example file containing complex nested structures
- **Handle JSON with comments** using appropriate parsing (JSON5)

## Implementation Architecture

### Core Files Structure

```
typescript/
├── src/
│   ├── models/
│   │   └── generated/          # All generated TypeScript interfaces
│   │       ├── essential-types.ts  # Generated enums and type guards
│   │       ├── block/          # Block-related interfaces
│   │       ├── file/           # File-related interfaces
│   │       ├── page/           # Page interfaces
│   │       └── shared_definitions/
│   ├── serialization/
│   │   └── loader.ts           # Serialization/deserialization logic
│   └── utils/
│       └── json.ts             # JSON utility functions
├── scripts/
│   └── generate-types.ts       # Type generation script
├── tests/
│   └── serialization.test.ts  # Comprehensive tests
└── package.json
```

## Type Generation System

### Key Script: `scripts/generate-types.ts`

This script is the heart of the implementation:

1. **JSON Schema Parsing**: Uses JSON5 to handle schemas with comments
2. **Enum Extraction**: Programmatically extracts enums from schema properties
3. **Interface Generation**: Uses json-schema-to-typescript to create TypeScript interfaces
4. **Reference Resolution**: Handles $ref links between schema files
5. **Essential Types Generation**: Creates only necessary enums and type guards

### Generated Types Categories

- **ObjectType**: page, block, user (extracted from schema const values)
- **BlockType**: paragraph, heading_1, etc. (extracted from block schema enums)
- **RichTextType**: text, equation (extracted from rich text schema)
- **FileType**: file, external (extracted from file schema)
- **ParentType**: page_id, block_id, etc.

### Type Guards

Automatically generated type guard functions:

- `isPage()`, `isBlock()` for object types
- `isParagraphBlock()`, `isHeading1Block()` etc. for block types
- `isRichTextText()`, `isRichTextEquation()` for rich text types
- `isExternalFile()`, `isFileFile()` for file types

## Serialization System

### Core Functions in `loader.ts`

- **`loadJsonDoc(obj)`**: Main entry point for loading JSON-DOC objects
- **`loadPage(obj)`**: Processes page objects
- **`loadBlock(obj)`**: Processes block objects with recursive children handling
- **`loadRichText(obj)`**: Processes rich text elements
- **`jsonDocDumpJson(obj)`**: Serializes objects back to JSON

### Factory Pattern

Uses factory functions for different block types:

- `createParagraphBlock()`, `createHeading1Block()`, etc.
- Each factory ensures proper object type assignment
- Maintains type safety throughout the process

## Testing Strategy

### Test Files

1. **Basic serialization tests**: Simple blocks with rich text
2. **Nested block tests**: Complex hierarchical structures
3. **Page serialization tests**: Full page objects with children
4. **Example file test**: Uses real schema/page/ex1_success.json (40k+ tokens)

### Test Requirements

- Load example JSON with comments using JSON5
- Process through loadJsonDoc() function
- Serialize back using jsonDocDumpJson()
- Compare normalized results (excluding null fields like 'link', 'href')
- Must achieve perfect round-trip serialization

## Build and Development

### NPM Scripts

```json
{
  "clean": "rm -rf dist",
  "build": "tsc",
  "generate-types": "ts-node scripts/generate-types.ts",
  "test": "jest",
  "prepublishOnly": "npm run clean && npm run generate-types && npm run build"
}
```

### Dependencies

- **Production**: ajv, ajv-formats, json5
- **Development**: @types/jest, jest, ts-jest, ts-node, typescript, json-schema-to-typescript

## Critical Implementation Details

### JSON Schema Comment Handling

- Many schema files contain comments (// and /\* \*/)
- Use JSON5.parse() for robust comment handling
- Fallback to manual comment stripping if needed
- Handle trailing commas and control characters

### Enum Value Consistency

- ObjectType enum values must match serialization strings ('block', 'page')
- BlockType enum keys use PascalCase but values remain original ('paragraph', 'to_do')
- Type guards use enum comparisons with fallback to string literals

### Reference Resolution

- Schema files use $ref to reference other schemas
- Script resolves references recursively (max 4 iterations)
- Handles both relative and absolute reference paths
- Creates simplified reference objects for type generation

### Error Handling

- Graceful degradation when schemas can't be parsed
- Fallback to empty objects rather than failing
- Comprehensive error logging for debugging
- Test fallbacks for missing files

## Development Challenges Solved

### 1. JSON Schema Parsing

**Problem**: Schema files contain comments and control characters
**Solution**: JSON5 parser with fallback to manual comment stripping

### 2. Hardcoded Types

**Problem**: User demanded no hardcoded enums
**Solution**: Extract all enum values from JSON schemas programmatically

### 3. Serialization Consistency

**Problem**: Round-trip serialization must produce identical results
**Solution**: Careful handling of null fields, proper factory functions, type normalization

### 4. Complex Example File

**Problem**: Must handle 40k+ token example file with deep nesting
**Solution**: Robust recursive processing, proper memory management, comprehensive testing

## User Feedback and Corrections

### Major User Corrections

1. **"GENERATE THE TYPES PROGRAMMATICALLY, OR ELSE!"** - Led to complete rewrite of type generation
2. **"Use /schema/page/ex1_success.json"** - Required handling large, complex real-world data
3. **"DO NOT FAIL"** - Emphasized importance of robust implementation

### User Expectations

- Zero tolerance for shortcuts or hardcoded values
- Must match Python implementation's functionality
- Comprehensive testing with real data
- Modern TypeScript best practices

## Future Maintenance

### When Adding New Block Types

1. Add schema file to appropriate directory
2. Run `npm run generate-types` to regenerate interfaces
3. Update factory function mapping in loader.ts if needed
4. Add tests for new block type

### When Modifying Schemas

1. Ensure backward compatibility
2. Regenerate types with `npm run generate-types`
3. Run full test suite to verify compatibility
4. Check serialization round-trip still works

### Performance Considerations

- Type generation is build-time, not runtime
- Serialization uses factory pattern for efficiency
- Recursive processing handles deep nesting gracefully
- JSON5 parsing adds minimal overhead

## Key Success Metrics

✅ All types generated from schemas (no hardcoding)
✅ Full test suite passing including example file
✅ Perfect round-trip serialization
✅ Handles complex nested structures
✅ Modern TypeScript with strict typing
✅ Proper error handling and fallbacks
✅ Comprehensive documentation and maintainability
