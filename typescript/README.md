# JSON-DOC TypeScript Implementation

A TypeScript implementation of JSON-DOC, a standardized format for storing structured content in JSON files, inspired by Notion's data model.

## Features

- **Programmatically Generated Types**: All TypeScript interfaces are automatically generated from JSON schemas
- **React Renderer**: Complete React component library for rendering JSON-DOC content
- **Rich Content Support**: Supports all major block types including paragraphs, headings, lists, tables, images, and more
- **Recursive Rendering**: Handles nested blocks at arbitrary depth
- **Notion-like Styling**: CSS styling inspired by Notion's visual design

## Installation

```bash
npm install @textcortex/jsondoc
```

## Usage

### Basic React Rendering

```tsx
import React from "react";
import { JsonDocRenderer } from "@textcortex/jsondoc";
import * as fs from "fs";
import * as JSON5 from "json5";

// Load JSON-DOC data (with comment support)
const pageData = JSON5.parse(fs.readFileSync("document.json", "utf-8"));

// Render the document
function App() {
  return (
    <div>
      <JsonDocRenderer page={pageData} />
    </div>
  );
}
```

### Individual Block Rendering

```tsx
import React from "react";
import { BlockRenderer } from "@textcortex/jsondoc";

function MyComponent({ block }) {
  return (
    <div>
      <BlockRenderer block={block} depth={0} />
    </div>
  );
}
```

### JSON-DOC Viewer (Browser)

View any JSON-DOC file directly in your browser with a single command:

```bash
# View a JSON-DOC file
npm run view path/to/your/document.json

# Example: View the test document
npm run view ../schema/page/ex1_success.json
```

This will:

1. Start a local server at `http://localhost:3000`
2. Automatically open your browser
3. Render the JSON-DOC file with full styling
4. Support all block types including nested structures

The viewer includes:

- **Live rendering** of all supported block types
- **Notion-like styling** with responsive design
- **Automatic browser opening** for convenience
- **File information** in the header (filename, block count)
- **Comment support** using JSON5 parsing

### Supported Block Types

The renderer supports all major JSON-DOC block types:

- **Text Blocks**: `paragraph`, `heading_1`, `heading_2`, `heading_3`
- **List Blocks**: `bulleted_list_item`, `numbered_list_item`
- **Rich Content**: `code`, `quote`, `equation`
- **Media**: `image` (both external URLs and file references)
- **Layout**: `table`, `table_row`, `column_list`, `column`
- **Interactive**: `to_do`, `toggle`
- **Utility**: `divider`

### Rich Text Features

Rich text content supports:

- **Formatting**: Bold, italic, strikethrough, underline, code
- **Colors**: All Notion color options
- **Links**: External links with proper `target="_blank"`
- **Equations**: Inline mathematical expressions

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

# View example JSON-DOC file in browser
npm run view ../schema/page/ex1_success.json
```

### Testing

The test suite includes:

```bash
# Run all tests
npm test

# Tests cover:
# - JSON utility functions (loadJson, deepClone)
# - Example file loading with comment support
# - Block type detection and validation
```

The tests verify:

- ✅ JSON loading and parsing functionality
- ✅ Deep cloning of complex objects
- ✅ Loading of the comprehensive example file (47 blocks, 16 types)
- ✅ Block type enumeration and structure validation

### Project Structure

- `src/models/`: TypeScript type definitions (generated from schemas)
- `src/renderer/`: React components for rendering JSON-DOC
- `src/utils/`: Helper functions
- `tests/`: Test suite

## Example Data Structure

JSON-DOC uses a hierarchical structure similar to Notion:

```json
{
  "object": "page",
  "id": "page-id",
  "properties": {
    "title": {
      "title": [
        {
          "type": "text",
          "text": { "content": "Document Title" }
        }
      ]
    }
  },
  "children": [
    {
      "object": "block",
      "type": "paragraph",
      "id": "block-id",
      "paragraph": {
        "rich_text": [
          {
            "type": "text",
            "text": { "content": "Hello, world!" },
            "annotations": {
              "bold": true,
              "color": "blue"
            }
          }
        ]
      },
      "children": []
    }
  ]
}
```

## React Component Architecture

```
JsonDocRenderer
├── Page (icon, title, properties)
└── BlockRenderer (recursive)
    ├── ParagraphBlockRenderer
    ├── HeadingBlockRenderer
    ├── ListItemBlockRenderer
    ├── CodeBlockRenderer
    ├── ImageBlockRenderer
    ├── TableBlockRenderer
    ├── QuoteBlockRenderer
    ├── DividerBlockRenderer
    ├── ToDoBlockRenderer
    ├── ToggleBlockRenderer
    ├── ColumnListBlockRenderer
    └── EquationBlockRenderer
```

### Key Features

1. **Recursive Rendering**: All block renderers support children blocks with proper nesting
2. **Type Safety**: Full TypeScript support with generated types
3. **Accessibility**: Proper ARIA attributes and semantic HTML
4. **Responsive Design**: Mobile-friendly layout with responsive columns
5. **Interactive Elements**: Toggle blocks can be expanded/collapsed, to-do items show state

## CSS Classes

The renderer uses Notion-inspired CSS classes for styling:

- `.json-doc-renderer` - Main container
- `.notion-selectable` - Individual blocks
- `.notion-text-block`, `.notion-header-block` - Block types
- `.notion-list-item-box-left` - List item bullets/numbers
- `.notion-table-content` - Table containers
- `.notion-inline-code` - Inline code formatting

## License

MIT

## Configuration

- TypeScript configuration follows best practices from [Total TypeScript](https://www.totaltypescript.com/tsconfig-cheat-sheet)

## Release workflow

We use bumpp to automatically bump package.json and lock files, create git tags and commits

1. Run:

```
 npx bumpp
```

2. You should see:

```

4 Commits since the last version:

5217cd1   : update readme
7a3c03d   : Expose page delimiter
e2791a4   : Merge branch 'main' of github.com:textcortex/JSON-DOC
b7b30c1   : Make more typesafe

✔ Current version 0.2.0-alpha.3 ›          next 0.2.0-alpha.4

   files package-lock.json
         package.json
  commit chore: release v0.2.0-alpha.4
     tag typescript-v0.2.0-alpha.4

    from 0.2.0-alpha.3
      to 0.2.0-alpha.4
```

You can choose a different version from the list or create new one. But bumpp is smart enough to use appropriate next version.

3. Verify and confirm
4. Push commit and tag
5. The new tag will trigger a release on github actions.
6. Go to github and create release using the new tag. Make sure you set the correct previous tag prefixed with `typescript-v`

## Todos

- [x] setup eslint
- [x] improve tsconfig
- [x] setup lint staged and husky
- [x] setup prettier
- [x] standardize styling (css)
- [x] fix styling for elements
  - [x] headings
  - [x] paragraph
  - [x] code
  - [x] table
  - [x] to-do items
  - [x] equation
  - [x] image
  - [x] blockquote
- [x] fix ts and eslint errors in these dirs and remove from ignore list of ts and eslint

  ```
      "**/generated/**",
      "src/serialization/**",
  ```

- [x] add counter for numbered lists
- [x] setup up bumpp: https://www.npmjs.com/package/bumpp
- [ ] migrate test runner to vitest
- [x] move vite app to typescript root examples dir
- [ ] setup monorepo tooling
- [ ] fix model generation for Image and RichText, then type renderers
- [x] use katex or similar package for equations
- [x] add error boundry
- [x] add page title highlighting
- [ ] validate page prop somehow. not clear how to do yet. we can't use the /schema because it's HUGE and also because it's outside of /typescript. Will need to think about this.

maybe do something like this?
```
import type { Page } from "../models/generated/page/page";
import { isPage } from "../models/generated/essential-types";

export function validatePage(obj: unknown): obj is Page {
  console.log("isPage(obj) ", isPage(obj));
  return (
    isPage(obj) &&
    typeof (obj as any).id === "string" &&
    Array.isArray((obj as any).children)
  );
}

export function validatePageWithError(obj: unknown): {
  valid: boolean;
  error?: string;
} {
  if (!isPage(obj)) {
    return { valid: false, error: "Not a valid page object" };
  }

  if (typeof (obj as any).id !== "string") {
    return { valid: false, error: "Page id must be a string" };
  }

  if (!Array.isArray((obj as any).children)) {
    return { valid: false, error: "Page children must be an array" };
  }

  return { valid: true };
}

```

will require us to write a validator and we won't benefit from the defined schema jsons.