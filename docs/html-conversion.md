
- Terminal text nodes are to be converted to rich text blocks.
- Order of children blocks must be preserved
- Any node in the syntax tree can generate 3 types of objects: string, rich text, or block.
- Consequently, any node can receive a list of these objects as as children. Each of these must be handled properly: merge rich texts, append rich text to current block, if they can't be appended in the current node, pass them to the parent node while preserving the order of the children, and so on.