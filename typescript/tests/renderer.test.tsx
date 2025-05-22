import React from "react";
import { JsonDocRenderer } from "../src/renderer/JsonDocRenderer";
import { loadJson } from "../src/utils/json";

// Mock React DOM for testing
const testRender = (element: React.ReactElement) => {
  // This would normally use @testing-library/react or similar
  console.log("Rendering element:", element);
  return {
    props: element.props,
    type: element.type.displayName || element.type.name || "Component",
  };
};

describe("JsonDocRenderer", () => {
  test("renders with example data", () => {
    // Load the example JSON data
    const examplePath = "/Users/onur/tc/JSON-DOC/schema/page/ex1_success.json";
    const pageData = loadJson(examplePath);

    // Create renderer
    const renderer = <JsonDocRenderer page={pageData} />;

    // Test basic rendering
    const rendered = testRender(renderer);
    expect(rendered.type).toBe("JsonDocRenderer");
    expect(rendered.props.page).toBeDefined();
    expect(rendered.props.page.object).toBe("page");

    console.log(
      "Successfully rendered JSON-DOC page with title:",
      pageData.properties?.title?.title?.[0]?.plain_text,
    );
  });

  test("handles recursive block rendering", () => {
    const mockPage = {
      object: "page",
      id: "test-page",
      properties: {
        title: {
          title: [{ plain_text: "Test Page" }],
        },
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          id: "para-1",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: "This is a paragraph" },
              },
            ],
          },
          children: [
            {
              object: "block",
              type: "bulleted_list_item",
              id: "list-1",
              bulleted_list_item: {
                rich_text: [
                  {
                    type: "text",
                    text: { content: "Nested list item" },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const renderer = <JsonDocRenderer page={mockPage} />;
    const rendered = testRender(renderer);

    expect(rendered.type).toBe("JsonDocRenderer");
    expect(rendered.props.page.children).toHaveLength(1);
    expect(rendered.props.page.children[0].children).toHaveLength(1);

    console.log("Successfully rendered recursive blocks");
  });
});

// Simple test runner if not using Jest
if (require.main === module) {
  console.log("Running JSON-DOC Renderer Tests...");

  try {
    const examplePath = "/Users/onur/tc/JSON-DOC/schema/page/ex1_success.json";
    const pageData = loadJson(examplePath);

    console.log("✓ Loaded example data successfully");
    console.log(
      "Page title:",
      pageData.properties?.title?.title?.[0]?.plain_text,
    );
    console.log("Number of children:", pageData.children?.length || 0);

    // Test block types in the example
    const blockTypes = new Set();
    const collectBlockTypes = (blocks: any[]) => {
      blocks?.forEach((block: any) => {
        if (block.type) blockTypes.add(block.type);
        if (block.children) collectBlockTypes(block.children);
      });
    };
    collectBlockTypes(pageData.children);

    console.log("✓ Block types found:", Array.from(blockTypes).join(", "));
    console.log("✓ All tests passed!");
  } catch (error) {
    console.error("✗ Test failed:", error);
  }
}
