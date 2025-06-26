// Helper to create a page with specific blocks
export const createPageWithBlocks = (blocks: any[]) => ({
  object: "page",
  id: "test-page",
  properties: {
    title: {
      type: "title",
      title: [
        {
          href: null,
          type: "text",
          text: { link: null, content: "Test Page" },
          annotations: {},
          plain_text: "Test Page",
        },
      ],
    },
  },
  children: blocks,
});
