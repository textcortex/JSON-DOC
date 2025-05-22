// Block type to component mapping
export const blockTypeMap = {
  paragraph: 'ParagraphBlock',
  heading_1: 'Heading1Block',
  heading_2: 'Heading2Block', 
  heading_3: 'Heading3Block',
  bulleted_list_item: 'BulletedListBlock',
  numbered_list_item: 'NumberedListBlock',
  to_do: 'TodoBlock',
  code: 'CodeBlock',
  quote: 'QuoteBlock',
  divider: 'DividerBlock',
  image: 'ImageBlock',
  equation: 'EquationBlock',
  table: 'TableBlock',
  table_row: 'TableRowBlock',
  column_list: 'ColumnListBlock',
  column: 'ColumnBlock',
  toggle: 'ToggleBlock'
};

// Get component name for block type
export function getComponentForBlockType(blockType) {
  return blockTypeMap[blockType] || 'UnsupportedBlock';
}

// Get all supported block types
export function getSupportedBlockTypes() {
  return Object.keys(blockTypeMap);
}