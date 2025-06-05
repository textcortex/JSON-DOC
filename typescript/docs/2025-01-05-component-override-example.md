---
title: "Component Override Example for JSON-DOC TypeScript"
author: "Abreham <abreham@textcortex.com> and Claude Code"
date: "2025-01-05"
---

# Component Override Example

This demonstrates how users can now override specific block components in the JSON-DOC renderer.

## Usage Example

```typescript
import { 
  JsonDocRenderer, 
  ParagraphBlockRenderer,
  HeadingBlockRenderer 
} from 'jsondoc/renderer';

// Example: Override paragraph with custom className
const CustomParagraph = (props) => (
  <ParagraphBlockRenderer 
    {...props} 
    className="my-custom-paragraph-style"
  />
);

// Example: Override heading with wrapper div and custom styling  
const CustomHeading = (props) => (
  <div className="my-heading-wrapper">
    <HeadingBlockRenderer 
      {...props} 
      className="my-custom-heading"
      style={{ color: 'blue' }}
    />
  </div>
);

// Usage
<JsonDocRenderer 
  page={jsonDocPage}
  components={{
    paragraph: CustomParagraph,
    heading_1: CustomHeading,
    heading_2: CustomHeading,
    heading_3: CustomHeading
  }}
/>
```

## What This Enables

1. **Custom Styling**: Users can add their own CSS classes and styles
2. **Wrapper Components**: Add additional markup around blocks  
3. **Custom Logic**: Add click handlers, analytics, etc.
4. **Design System Integration**: Easy integration with Tailwind, styled-components, etc.
5. **Progressive Enhancement**: Override only what you need, keep defaults for the rest

## Example with Tailwind CSS

```typescript
const TailwindParagraph = (props) => (
  <ParagraphBlockRenderer 
    {...props} 
    className="prose prose-lg text-gray-700 leading-relaxed"
  />
);

const TailwindHeading = (props) => (
  <HeadingBlockRenderer 
    {...props} 
    className="font-bold text-gray-900 border-b border-gray-200 pb-2"
  />
);
```

## Example with Styled Components

```typescript
const StyledParagraph = styled(ParagraphBlockRenderer)`
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  color: ${props => props.theme.colors.text};
`;

const StyledHeading = styled(HeadingBlockRenderer)`
  font-family: 'Playfair Display', serif;
  color: ${props => props.theme.colors.primary};
  border-bottom: 2px solid ${props => props.theme.colors.accent};
`;
```

## Benefits of This Approach

- **Verbose but Explicit**: Clear what each override does
- **Type Safe**: Full TypeScript support for component props
- **React Standard**: Follows familiar React patterns
- **Composable**: Can wrap, extend, or completely replace components
- **Flexible**: Access to all HTML attributes via props spreading