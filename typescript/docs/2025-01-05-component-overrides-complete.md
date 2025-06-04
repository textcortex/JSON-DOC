---
title: "Complete Component Override System for JSON-DOC TypeScript"
author: "Abreham <abreham@textcortex.com> and Claude Code"
date: "2025-01-05"
---

# Complete Component Override System

✅ **Implementation Complete!** All block components now support the react-markdown style component override pattern.

## 🚀 Usage Examples

### Basic Component Overrides

```typescript
import { 
  JsonDocRenderer, 
  ParagraphBlockRenderer,
  HeadingBlockRenderer,
  CodeBlockRenderer,
  QuoteBlockRenderer,
  type BlockComponents 
} from 'jsondoc/renderer';

// Custom paragraph with Tailwind styling
const CustomParagraph = (props) => (
  <ParagraphBlockRenderer 
    {...props} 
    className="prose prose-lg text-gray-700 leading-relaxed my-4"
  />
);

// Custom heading with icon and custom styling  
const CustomHeading = (props) => (
  <div className="heading-wrapper">
    <span className="heading-icon">📝</span>
    <HeadingBlockRenderer 
      {...props} 
      className="font-bold text-blue-600 border-b-2 border-blue-200"
      onClick={() => console.log('Heading clicked:', props.block.id)}
    />
  </div>
);

// Custom code block with syntax highlighting
const CustomCodeBlock = (props) => (
  <div className="code-wrapper">
    <div className="code-header">
      <span>💻 Code</span>
      <button onClick={() => navigator.clipboard.writeText(props.block.code?.rich_text?.[0]?.plain_text)}>
        Copy
      </button>
    </div>
    <CodeBlockRenderer 
      {...props} 
      className="bg-gray-900 text-green-400 rounded-lg p-4"
    />
  </div>
);

// Usage with multiple overrides
<JsonDocRenderer 
  page={jsonDocPage}
  components={{
    paragraph: CustomParagraph,
    heading_1: CustomHeading,
    heading_2: CustomHeading,
    heading_3: CustomHeading,
    code: CustomCodeBlock,
    quote: (props) => (
      <QuoteBlockRenderer 
        {...props} 
        className="border-l-4 border-blue-500 bg-blue-50 p-4 italic"
      />
    )
  }}
/>
```

## 🎨 Design System Integration

### Tailwind CSS
```typescript
const tailwindComponents: BlockComponents = {
  paragraph: (props) => (
    <ParagraphBlockRenderer 
      {...props} 
      className="text-gray-800 leading-7 mb-4"
    />
  ),
  heading_1: (props) => (
    <HeadingBlockRenderer 
      {...props} 
      className="text-4xl font-bold text-gray-900 mb-6 border-b pb-2"
    />
  ),
  code: (props) => (
    <CodeBlockRenderer 
      {...props} 
      className="bg-gray-100 rounded-md p-4 font-mono text-sm overflow-x-auto"
    />
  ),
  quote: (props) => (
    <QuoteBlockRenderer 
      {...props} 
      className="border-l-4 border-indigo-500 pl-4 italic text-gray-600"
    />
  ),
  to_do: (props) => (
    <ToDoBlockRenderer 
      {...props} 
      className="flex items-start space-x-2 my-2 hover:bg-gray-50 p-2 rounded"
    />
  )
};
```

### Styled Components
```typescript
import styled from 'styled-components';

const StyledParagraph = styled(ParagraphBlockRenderer)`
  font-family: 'Georgia', serif;
  line-height: 1.8;
  color: ${props => props.theme.colors.text};
  margin-bottom: 1.5rem;
`;

const StyledHeading = styled(HeadingBlockRenderer)`
  font-family: 'Playfair Display', serif;
  color: ${props => props.theme.colors.primary};
  border-bottom: 2px solid ${props => props.theme.colors.accent};
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
`;

const styledComponents: BlockComponents = {
  paragraph: StyledParagraph,
  heading_1: StyledHeading,
  heading_2: StyledHeading,
  heading_3: StyledHeading,
};
```

## 🔧 All Supported Block Types

Every block type supports component overrides:

```typescript
type BlockComponents = {
  // Text blocks
  paragraph?: React.ComponentType<...>;
  heading_1?: React.ComponentType<...>;
  heading_2?: React.ComponentType<...>;
  heading_3?: React.ComponentType<...>;
  
  // List blocks
  bulleted_list_item?: React.ComponentType<...>;
  numbered_list_item?: React.ComponentType<...>;
  unordered_list?: React.ComponentType<...>;
  ordered_list?: React.ComponentType<...>;
  
  // Media blocks
  code?: React.ComponentType<...>;
  image?: React.ComponentType<...>;
  equation?: React.ComponentType<...>;
  
  // Layout blocks
  table?: React.ComponentType<...>;
  column_list?: React.ComponentType<...>;
  
  // Interactive blocks
  quote?: React.ComponentType<...>;
  divider?: React.ComponentType<...>;
  to_do?: React.ComponentType<...>;
  toggle?: React.ComponentType<...>;
};
```

## 🌟 Advanced Use Cases

### Analytics Integration
```typescript
const AnalyticsWrapper = ({ children, blockType, blockId }) => {
  const trackBlockView = () => {
    analytics.track('block_viewed', { blockType, blockId });
  };

  useEffect(trackBlockView, []);

  return <div onIntersectionObserver={trackBlockView}>{children}</div>;
};

const analyticsComponents: BlockComponents = {
  heading_1: (props) => (
    <AnalyticsWrapper blockType="heading_1" blockId={props.block.id}>
      <HeadingBlockRenderer {...props} />
    </AnalyticsWrapper>
  ),
  code: (props) => (
    <AnalyticsWrapper blockType="code" blockId={props.block.id}>
      <CodeBlockRenderer {...props} />
    </AnalyticsWrapper>
  )
};
```

### Dark Mode Support
```typescript
const DarkModeComponents: BlockComponents = {
  paragraph: (props) => (
    <ParagraphBlockRenderer 
      {...props} 
      className="dark:text-gray-200 text-gray-800"
    />
  ),
  code: (props) => (
    <CodeBlockRenderer 
      {...props} 
      className="dark:bg-gray-800 bg-gray-100 dark:text-green-400 text-gray-800"
    />
  ),
  quote: (props) => (
    <QuoteBlockRenderer 
      {...props} 
      className="dark:border-gray-600 border-gray-300 dark:bg-gray-800 bg-gray-50"
    />
  )
};
```

## ✨ Features Accomplished

✅ **All block types support component overrides**  
✅ **Full React HTML attributes support** (className, style, onClick, etc.)  
✅ **TypeScript type safety** with full prop typing  
✅ **Recursive component propagation** - overrides apply to nested blocks  
✅ **Individual component exports** for maximum flexibility  
✅ **Zero breaking changes** - existing usage continues to work  
✅ **React-markdown compatibility** - familiar API patterns  

## 🎯 Migration Path

**Existing users:** No changes needed - everything works as before

**New users wanting customization:**
1. Import the components you want to override
2. Create wrapper components with your styling
3. Pass them via the `components` prop

**Advanced users:**
- Mix and match individual components
- Create design system integrations
- Build interactive enhancements
- Add analytics and tracking

The implementation provides maximum flexibility while maintaining simplicity and performance!