# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JSON-DOC is a standardized format for storing structured content in JSON files, inspired by Notion's data model. It supports a wide variety of content types including paragraphs, headings, lists, tables, images, code blocks, and more.

The project consists of:
1. A JSON schema specification for the format
2. A Python implementation
3. A TypeScript implementation (in progress)
4. Converters for various formats (HTML, Markdown, etc.)

## Project Structure

- `/schema/`: JSON schemas defining the structure of JSON-DOC files
- `/python/`: Python implementation
- `/ts/`: TypeScript implementation (in progress)
- `/docs/`: Documentation
- `/examples/`: Example files showing the format
- `/tests/`: Tests for both implementations

## Development Commands

### Python Development

```bash
# Set up development environment
cd /Users/onur/tc/JSON-DOC/python
python -m pip install -e .
python -m pip install -e ".[dev]"

# Run tests
cd /Users/onur/tc/JSON-DOC/python
pytest

# Run a specific test
cd /Users/onur/tc/JSON-DOC/python
pytest tests/test_serialization.py -v

# Run validation tests
cd /Users/onur/tc/JSON-DOC/python
python tests/test_validation.py schema

# Run linting
cd /Users/onur/tc/JSON-DOC/python
ruff check .
ruff format .
```

### TypeScript Development

```bash
# Set up development environment
cd /Users/onur/tc/JSON-DOC/ts
npm install

# Build TypeScript
cd /Users/onur/tc/JSON-DOC/ts
npm run build

# Run tests
cd /Users/onur/tc/JSON-DOC/ts
npm test
```

## Architecture Overview

### JSON-DOC Schema

The JSON-DOC schema is defined in JSONSchema format, with the following primary components:

1. **Page**: The top-level container for all content
2. **Block**: Content blocks of various types (paragraph, heading, list item, etc.)
3. **Rich Text**: Text content with formatting (bold, italic, etc.)
4. **File**: External file references (images, etc.)

Each block type has specific schemas and validation rules.

### Python Implementation

The Python implementation uses Pydantic models for validation and serialization, with:

- Block types implemented as classes inheriting from a base Block class
- Rich text types implemented as classes inheriting from a base RichText class
- Serialization/deserialization functions for loading and saving JSON-DOC files
- Converters for HTML, Markdown, and other formats

Key modules:
- `jsondoc.models`: Pydantic models for JSON-DOC
- `jsondoc.serialize`: Functions for loading/saving JSON-DOC
- `jsondoc.validate`: Schema validation
- `jsondoc.convert`: Conversion between formats

### TypeScript Implementation

The TypeScript implementation is in progress, following similar architecture to the Python version:

- Type definitions for all JSON-DOC structures
- Functions for loading/saving JSON-DOC files
- Schema validation
- Converters for other formats

## Testing Strategy

- Schema validation tests ensure examples conform to schemas
- Serialization tests ensure round-trip conversion preserves data
- Conversion tests verify correct transformation between formats
- Integration tests for end-to-end workflows

## Implementation Notes

1. The project follows a modular architecture with clear separation between:
   - Schema definition
   - Model implementation
   - Validation
   - Serialization
   - Conversion

2. The TypeScript implementation should follow the same patterns as the Python implementation, with appropriate adaptations for the TypeScript ecosystem.

3. The core functionality is focused on:
   - Loading JSON-DOC files into typed objects
   - Validating JSON-DOC files against schemas
   - Converting between JSON-DOC and other formats


# Code generation guidelines
- don's assume things, if some things are clear, ask for clarification
