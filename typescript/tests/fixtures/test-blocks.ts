import {
  Block,
  ParagraphBlock,
  Heading1Block,
  Heading2Block,
  Heading3Block,
  BulletedListItemBlock,
  NumberedListItemBlock,
  CodeBlock,
  ImageBlock,
  QuoteBlock,
  DividerBlock,
  ToDoBlock,
  ToggleBlock,
  TableBlock,
  ColumnListBlock,
  EquationBlock,
  Page,
} from "@/models/generated";

// Mock data for all block types to test comprehensive rendering
export const mockBlocks: Record<
  string,
  | Block
  | ParagraphBlock
  | Heading1Block
  | Heading2Block
  | Heading3Block
  | BulletedListItemBlock
  | NumberedListItemBlock
  | CodeBlock
  | ImageBlock
  | QuoteBlock
  | DividerBlock
  | ToDoBlock
  | ToggleBlock
  | TableBlock
  | ColumnListBlock
  | EquationBlock
> = {
  paragraph: {
    object: "block",
    id: "para-1",
    type: "paragraph",
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: false,
    paragraph: {
      rich_text: [
        {
          type: "text",
          text: { content: "This is a paragraph with " },
          annotations: {},
          plain_text: "This is a paragraph with ",
        },
        {
          type: "text",
          text: { content: "bold text" },
          annotations: { bold: true },
          plain_text: "bold text",
        },
        {
          type: "text",
          text: { content: " and " },
          annotations: {},
          plain_text: " and ",
        },
        {
          type: "text",
          text: { content: "italic text" },
          annotations: { italic: true },
          plain_text: "italic text",
        },
      ],
    },
  },

  heading_1: {
    object: "block",
    id: "h1-1",
    type: "heading_1",
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: false,
    heading_1: {
      rich_text: [
        {
          type: "text",
          text: { content: "Main Heading" },
          annotations: {},
          plain_text: "Main Heading",
        },
      ],
    },
  },

  heading_2: {
    object: "block",
    id: "h2-1",
    type: "heading_2",
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: false,
    heading_2: {
      rich_text: [
        {
          type: "text",
          text: { content: "Subheading" },
          annotations: {},
          plain_text: "Subheading",
        },
      ],
    },
  },

  heading_3: {
    object: "block",
    id: "h3-1",
    type: "heading_3",
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: false,
    heading_3: {
      rich_text: [
        {
          type: "text",
          text: { content: "Sub-subheading" },
          annotations: {},
          plain_text: "Sub-subheading",
        },
      ],
    },
  },

  bulleted_list_item: {
    object: "block",
    id: "bullet-1",
    type: "bulleted_list_item",
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: true,
    bulleted_list_item: {
      rich_text: [
        {
          type: "text",
          text: { content: "First bullet point" },
          annotations: {},
          plain_text: "First bullet point",
        },
      ],
    },
    children: [
      {
        object: "block",
        id: "bullet-1-1",
        type: "bulleted_list_item",
        created_time: "2025-06-24T09:44:12.014249Z",
        has_children: false,
        // @ts-expect-error
        bulleted_list_item: {
          rich_text: [
            {
              type: "text",
              text: { content: "Nested bullet point" },
              annotations: {},
              plain_text: "Nested bullet point",
            },
          ],
        },
      },
    ],
  },

  numbered_list_item: {
    object: "block",
    id: "number-1",
    type: "numbered_list_item",
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: false,
    numbered_list_item: {
      rich_text: [
        {
          type: "text",
          text: { content: "First numbered item" },
          annotations: {},
          plain_text: "First numbered item",
        },
      ],
    },
  },

  code: {
    object: "block",
    id: "code-1",
    type: "code",
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: false,
    code: {
      rich_text: [
        {
          type: "text",
          text: { content: 'console.log("Hello, World!");' },
          annotations: {},
          plain_text: 'console.log("Hello, World!");',
        },
      ],
      language: "javascript",
    },
  },

  image: {
    object: "block",
    id: "image-1",
    type: "image",
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: false,
    image: {
      type: "external",
      external: {
        url: "https://example.com/image.jpg",
      },
      caption: [
        {
          type: "text",
          text: { content: "Sample image caption" },
          annotations: {},
          plain_text: "Sample image caption",
        },
      ],
    },
  },

  quote: {
    object: "block",
    id: "quote-1",
    type: "quote",
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: false,
    quote: {
      rich_text: [
        {
          type: "text",
          text: { content: "This is an inspirational quote." },
          annotations: {},
          plain_text: "This is an inspirational quote.",
        },
      ],
    },
  },

  divider: {
    object: "block",
    id: "divider-1",
    type: "divider",
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: false,
    divider: {},
  },

  to_do: {
    object: "block",
    id: "todo-1",
    type: "to_do",
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: false,
    to_do: {
      rich_text: [
        {
          type: "text",
          text: { content: "Complete this task" },
          annotations: {},
          plain_text: "Complete this task",
        },
      ],
      checked: false,
    },
  },

  toggle: {
    object: "block",
    id: "toggle-1",
    type: "toggle",
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: true,
    toggle: {
      rich_text: [
        {
          type: "text",
          text: { content: "Toggle block title" },
          annotations: {},
          plain_text: "Toggle block title",
        },
      ],
    },
    children: [
      {
        object: "block",
        id: "toggle-child-1",
        type: "paragraph",
        created_time: "2025-06-24T09:44:12.014249Z",
        has_children: false,
        // @ts-expect-error
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: { content: "Hidden content inside toggle" },
              annotations: {},
              plain_text: "Hidden content inside toggle",
            },
          ],
        },
      },
    ],
  },

  table: {
    object: "block",
    id: "table-1",
    type: "table",
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: true,
    table: {
      table_width: 2,
      has_column_header: true,
      has_row_header: false,
    },
    children: [
      {
        object: "block",
        id: "table-row-1",
        type: "table_row",
        created_time: "2025-06-24T09:44:12.014249Z",
        has_children: false,
        table_row: {
          cells: [
            [
              {
                type: "text",
                text: { content: "Header 1" },
                annotations: {},
                plain_text: "Header 1",
              },
            ],
            [
              {
                type: "text",
                text: { content: "Header 2" },
                annotations: {},
                plain_text: "Header 2",
              },
            ],
          ],
        },
      },
      {
        object: "block",
        id: "table-row-2",
        type: "table_row",
        created_time: "2025-06-24T09:44:12.014249Z",
        has_children: false,
        table_row: {
          cells: [
            [
              {
                type: "text",
                text: { content: "Cell 1" },
                annotations: {},
                plain_text: "Cell 1",
              },
            ],
            [
              {
                type: "text",
                text: { content: "Cell 2" },
                annotations: {},
                plain_text: "Cell 2",
              },
            ],
          ],
        },
      },
    ],
  },

  column_list: {
    object: "block",
    id: "column-list-1",
    type: "column_list",
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: true,
    column_list: {},
    children: [
      {
        object: "block",
        id: "column-1",
        type: "column",
        created_time: "2025-06-24T09:44:12.014249Z",
        has_children: true,
        column: {},
        children: [
          {
            object: "block",
            id: "column-1-para",
            type: "paragraph",
            created_time: "2025-06-24T09:44:12.014249Z",
            has_children: false,
            // @ts-expect-error
            paragraph: {
              rich_text: [
                {
                  type: "text",
                  text: { content: "Content in first column" },
                  annotations: {},
                  plain_text: "Content in first column",
                },
              ],
            },
          },
        ],
      },
      {
        object: "block",
        id: "column-2",
        type: "column",
        created_time: "2025-06-24T09:44:12.014249Z",
        has_children: true,
        column: {},
        children: [
          {
            object: "block",
            id: "column-2-para",
            type: "paragraph",
            created_time: "2025-06-24T09:44:12.014249Z",
            has_children: false,
            paragraph: {
              rich_text: [
                {
                  type: "text",
                  text: { content: "Content in second column" },
                  annotations: {},
                  plain_text: "Content in second column",
                },
              ],
            },
          },
        ],
      },
    ],
  },

  equation: {
    object: "block",
    id: "equation-1",
    type: "equation",
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: false,
    equation: {
      expression: "E = mc^2",
    },
  },

  // Mock unsupported block types for testing fallback behavior
  unsupported_single: {
    object: "block",
    id: "unsupported-1",
    type: "custom_widget" as any,
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: false,
  },

  unsupported_with_content: {
    object: "block",
    id: "unsupported-2",
    type: "ai_block" as any,
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: false,
    // @ts-expect-error
    ai_block: {
      prompt: "Generate something amazing",
    },
  },

  unsupported_with_children: {
    object: "block",
    id: "unsupported-3",
    type: "template_block" as any,
    created_time: "2025-06-24T09:44:12.014249Z",
    has_children: true,
    template_block: {
      template_id: "template-123",
    },
    children: [
      {
        object: "block",
        id: "h1-1",
        // @ts-ignore
        type: "paragraph",
        created_time: "2025-06-24T09:44:12.014249Z",
        has_children: false,
        // @ts-ignore
        heading_1: {
          rich_text: [
            {
              type: "text",
              text: { content: "Main Heading" },
              annotations: {},
              plain_text: "Main Heading",
            },
          ],
        },
      },
    ],
  },
};

// Complete page with all block types for comprehensive testing
export const mockPageWithAllBlocks: Page = {
  object: "page",
  id: "pg_01jygn5qmzexnvjrypnh41k8we",
  created_time: "2025-06-24T09:44:12.014249Z",
  created_by: {
    object: "user",
    id: "28a08aa3-192b-45e6-b6d3-32b8032d8c7b",
  },
  properties: {
    title: {
      type: "title",
      title: [
        {
          href: null,
          type: "text",
          text: {
            link: null,
            content: "Test Page with All Block Types",
          },
          annotations: {},
          plain_text: "Test Page with All Block Types",
        },
      ],
    },
  },
  children: Object.values(mockBlocks),
};
