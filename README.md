# JSON-DOC

JSON-DOC is a standardized format for storing structured content in JSON files, inspired by Notion's data model. It supports a wide variety of content types including paragraphs, headings, lists, tables, images, code blocks, and more.

## Overview

This project provides:

1. **JSON Schema Specification**: Complete schema definitions for all JSON-DOC structures
2. **Python Implementation**: Full-featured Python library with validation and conversion tools
3. **TypeScript Implementation**: TypeScript library with React renderer components
4. **Format Converters**: Tools to convert between JSON-DOC and other formats (HTML, Markdown, etc.)

## Installation

### Python Package

```bash
pip install python-jsondoc
```

### TypeScript Package

```bash
npm install @textcortex/jsondoc
```

## Quick Start

### Python

```python
from jsondoc import load_json_doc, json_doc_dump_json
from jsondoc.convert.html import convert_html_to_json_doc

# Load a JSON-DOC document
with open('document.json', 'r') as f:
    doc = load_json_doc(f.read())

# Convert HTML to JSON-DOC
html_content = "<h1>Hello World</h1><p>This is a paragraph.</p>"
json_doc = convert_html_to_json_doc(html_content)

# Serialize back to JSON
json_str = json_doc_dump_json(json_doc)
```

### TypeScript

```typescript
import { loadJsonDoc, JsonDocRenderer } from '@textcortex/jsondoc';
import React from 'react';

// Load and render a JSON-DOC document
const App = () => {
  const doc = loadJsonDoc(jsonDocData);

  return (
    <div>
      <JsonDocRenderer document={doc} />
    </div>
  );
};
```

## Features

### Core Features
- **Structured Content**: Documents represented as hierarchical blocks
- **Rich Text Support**: Text formatting with bold, italic, links, equations, and more
- **Nested Blocks**: Support for complex document structures with nested content
- **Schema Validation**: Full JSON Schema validation for all content types

### Supported Block Types
- **Text Blocks**: Paragraphs, headings (1-3), quotes, code blocks
- **List Blocks**: Bulleted lists, numbered lists, to-do lists, toggles
- **Media Blocks**: Images (external URLs and file references), equations
- **Layout Blocks**: Columns, dividers, tables
- **Interactive Blocks**: To-do items with checkbox state
- Check schema/ for all block types

### Format Conversion
- Convert between JSON-DOC and all other formats with HTML as the intermediate format

## Repository Structure

```
.
├── schema/                 # JSON Schema definitions
├── python/                # Python implementation
├── typescript/            # TypeScript implementation
├── docs/                  # Documentation
├── examples/              # Example files and usage
└── .github/workflows/     # CI/CD pipelines
```

## Development

### Python Development

```bash
# Setup
cd python
pip install -e ".[dev]"

# Run tests
pytest

# Format code
ruff format .
ruff check .

# Validate schemas
python tests/test_validation.py schema
```

### TypeScript Development

```bash
# Setup
cd typescript
npm install

# Generate types from schemas
npm run generate-types

# Build
npm run build

# Run tests
npm test

# Format code (runs automatically on commit)
npm run format
```

## Architecture

### JSON-DOC Schema

The format is defined using JSON Schema with these core components:

- **Page**: Top-level container with metadata and children blocks
- **Block**: Content blocks of various types (paragraph, heading, list, etc.)
- **Rich Text**: Formatted text content with styling and annotations
- **File**: External file references for images and attachments

### Implementation Philosophy
- **Schema-First**: All types generated programmatically from JSON schemas
- **Validation**: Comprehensive validation using JSON Schema
- **Serialization**: Perfect round-trip serialization between JSON and typed objects
- **Extensibility**: Easy to add new block types via schema updates

## Examples

See the [`examples/`](./examples/) directory for:
- Sample JSON-DOC documents
- HTML conversion examples
- Usage patterns and best practices

## Documentation

- [JSON-DOC Specification](./docs/json-doc-spec.md)
- [Python Implementation Guide](./docs/python-implementation.md)
- [TypeScript Implementation Guide](./docs/typescript-implementation.md)
- [Conversion Guide](./docs/conversion.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run the full test suite
5. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

Inspired by [Notion's](https://notion.so) block-based document model. This project aims to provide an open, standardized format for structured content representation.