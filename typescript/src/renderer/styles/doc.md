# JSON-DOC Renderer Styles

This directory contains the modular CSS architecture for the JSON-DOC renderer. The styles are organized into logical modules with customizable CSS variables for easy theming.

## Architecture

### File Structure

```
styles/
├── index.css          # Main entry point - imports all modules
├── variables.css      # CSS custom properties (design tokens)
├── base.css          # Base layout and page styles
├── typography.css    # Text and heading styles
├── blocks.css        # Block component styles
├── lists.css         # List-specific styles
├── table.css         # Table styles
├── media.css         # Image and media styles
├── layout.css        # Layout components (columns)
├── responsive.css    # Responsive breakpoints
└── README.md         # This file
```

## Usage

### Default Import

The renderer automatically imports the default styles:

```typescript
import { JsonDocRenderer } from "@json-doc/typescript";
// Styles are automatically included
```

### Custom Styling

To customize styles, you can:

1. **Override CSS Variables** (recommended):

```css
:root {
  --jsondoc-text-primary: #2d3748;
  --jsondoc-font-family-sans: "Inter", sans-serif;
  --jsondoc-spacing-lg: 20px;
}
```

2. **Import Individual Modules**:

```css
@import "@json-doc/typescript/dist/renderer/styles/variables.css";
@import "@json-doc/typescript/dist/renderer/styles/base.css";
/* Import only what you need */
```

3. **Create Your Own Theme**:

```css
/* my-theme.css */
@import "@json-doc/typescript/dist/renderer/styles/variables.css";

:root {
  /* Override variables */
  --jsondoc-text-primary: #1a202c;
  --jsondoc-bg-code: #f7fafc;
}

@import "@json-doc/typescript/dist/renderer/styles/base.css";
/* Import other modules as needed */
```

## CSS Variables (Design Tokens)

### Colors

- `--jsondoc-text-primary`: Primary text color
- `--jsondoc-text-secondary`: Secondary text color
- `--jsondoc-text-muted`: Muted text color
- `--jsondoc-border-light`: Light border color
- `--jsondoc-border-medium`: Medium border color

### Background Colors

- `--jsondoc-bg-code`: Code block background
- `--jsondoc-bg-inline-code`: Inline code background
- `--jsondoc-bg-unsupported`: Unsupported block background

### Text Colors

- `--jsondoc-color-gray` through `--jsondoc-color-red`: Notion-style text colors

### Typography

- `--jsondoc-font-family-sans`: Sans-serif font stack
- `--jsondoc-font-family-mono`: Monospace font stack
- `--jsondoc-font-family-serif`: Serif font stack
- `--jsondoc-font-size-*`: Font sizes for different elements
- `--jsondoc-font-weight-*`: Font weights
- `--jsondoc-line-height-*`: Line heights

### Spacing

- `--jsondoc-spacing-xs` through `--jsondoc-spacing-3xl`: Consistent spacing scale

### Layout

- `--jsondoc-page-max-width`: Maximum page width
- `--jsondoc-page-padding-desktop`: Desktop page padding
- `--jsondoc-page-padding-mobile`: Mobile page padding
- `--jsondoc-column-gap`: Gap between columns

## Theming

### Light/Dark Mode

The styles include automatic dark mode support:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --jsondoc-text-primary: #ffffff;
    /* Other dark mode overrides */
  }
}
```

### Manual Theme Classes

Force specific themes using classes:

```html
<div class="jsondoc-theme-light">
  <!-- Always light theme -->
</div>

<div class="jsondoc-theme-dark">
  <!-- Always dark theme -->
</div>
```

### Custom Color Schemes

Create your own color schemes:

```css
.my-custom-theme {
  --jsondoc-text-primary: #2b6cb0;
  --jsondoc-bg-code: #ebf4ff;
  --jsondoc-color-blue: #3182ce;
}
```

## Responsive Design

The styles include responsive breakpoints:

- Desktop: Default styles
- Tablet: `max-width: 768px`
- Mobile: `max-width: 480px`

Override responsive behavior:

```css
@media (max-width: 768px) {
  :root {
    --jsondoc-page-padding-desktop: 16px;
  }
}
```

## Block-Specific Styling

Each block type has its own CSS class namespace:

- `.notion-text-block`: Paragraph blocks
- `.notion-header-block`: Heading 1 blocks
- `.notion-sub_header-block`: Heading 2/3 blocks
- `.notion-code-block`: Code blocks
- `.notion-quote-block`: Quote blocks
- `.notion-to_do-block`: To-do blocks
- `.notion-table-block`: Table blocks
- `.notion-image-block`: Image blocks
- `.notion-column_list-block`: Column list blocks

## Advanced Customization

### Overriding Specific Components

```css
/* Custom code block styling */
.notion-code-block {
  background: var(--my-code-bg);
  border: 1px solid var(--my-code-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### Adding Custom Animations

```css
.notion-selectable {
  transition: all 0.2s ease;
}

.notion-selectable:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

### Print Styles

```css
@media print {
  .json-doc-page {
    padding: 0;
    max-width: none;
  }

  .notion-toggle-block {
    /* Expand all toggles for print */
  }
}
```

## Browser Compatibility

The styles use modern CSS features:

- CSS Custom Properties (CSS Variables)
- CSS Grid and Flexbox
- CSS Logical Properties

Supports:

- Chrome/Edge 49+
- Firefox 31+
- Safari 9.1+

For older browser support, consider using a CSS preprocessor to compile variables to static values.

## Performance Considerations

- CSS is tree-shakeable when importing individual modules
- Variables are computed at runtime but cached by browsers
- No JavaScript dependencies for styling
- Minimal CSS bundle size (~15KB gzipped)

## Contributing

When adding new styles:

1. Add design tokens to `variables.css` first
2. Use existing variables instead of hardcoded values
3. Follow the modular structure
4. Test responsive behavior
5. Ensure dark mode compatibility
6. Update this README with new variables or classes
