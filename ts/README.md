# JSON-DOC TypeScript Implementation

TypeScript implementation of the JSON-DOC specification.

## Installation

```bash
npm install jsondoc
```

## Usage

```typescript
import { loadJsonDoc, jsonDocDumpJson } from 'jsondoc';

// Load JSON-DOC from a string or object
const jsonString = '{"object":"page","id":"page-id","children":[...]}';
const doc = loadJsonDoc(jsonString);

// Or load from an object
const jsonObject = {
  object: 'page',
  id: 'page-id',
  children: [...]
};
const doc2 = loadJsonDoc(jsonObject);

// Serialize back to JSON
const serialized = jsonDocDumpJson(doc, 2); // 2 spaces indentation
```

## Features

- Full TypeScript type definitions for JSON-DOC format
- Load and serialize JSON-DOC objects
- Type-safe handling of different block types
- Runtime validation using JSON Schema
- Support for all block types defined in the JSON-DOC specification

## Development

### Setup

```bash
# Install dependencies
npm install

# Generate TypeScript types from JSON schemas
npm run generate-types

# Build the project
npm run build

# Run tests
npm test
```

### Project Structure

- `src/models/`: TypeScript type definitions
- `src/serialization/`: Functions for loading and serializing JSON-DOC
- `src/validation/`: JSON schema validation utilities
- `src/utils/`: Helper functions
- `tests/`: Test suite

## License

MIT