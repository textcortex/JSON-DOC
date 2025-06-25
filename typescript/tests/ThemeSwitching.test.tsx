import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { JsonDocRenderer } from "../src/renderer/JsonDocRenderer";
import { mockBlocks, mockPageWithAllBlocks } from "./fixtures/test-blocks";

// Helper to create a simple page for theme testing
const createSimplePage = () => ({
  object: "page",
  id: "theme-test-page",
  properties: {
    title: {
      type: "title",
      title: [
        {
          href: null,
          type: "text",
          text: { link: null, content: "Theme Test Page" },
          annotations: {},
          plain_text: "Theme Test Page",
        },
      ],
    },
  },
  children: [mockBlocks.paragraph],
});

const JSON_DOC_ROOT_TEST_ID = "jsondoc-renderer-root";

describe("JsonDocRenderer - Theme Switching", () => {
  const simplePage = createSimplePage();

  it("renders with light theme by default", () => {
    const { container } = render(<JsonDocRenderer page={simplePage} />);

    const rendererDiv = screen.getByTestId(JSON_DOC_ROOT_TEST_ID);
    expect(rendererDiv).toHaveClass("jsondoc-theme-light");
    expect(rendererDiv).not.toHaveClass("jsondoc-theme-dark");
  });

  it("renders with light theme when explicitly set", () => {
    const { container } = render(
      <JsonDocRenderer page={simplePage} theme="light" />
    );

    const rendererDiv = screen.getByTestId(JSON_DOC_ROOT_TEST_ID);
    expect(rendererDiv).toHaveClass("jsondoc-theme-light");
    expect(rendererDiv).not.toHaveClass("jsondoc-theme-dark");
  });

  it("renders with dark theme when theme prop is set to dark", () => {
    const { container } = render(
      <JsonDocRenderer page={simplePage} theme="dark" />
    );

    const rendererDiv = screen.getByTestId(JSON_DOC_ROOT_TEST_ID);
    expect(rendererDiv).toHaveClass("jsondoc-theme-dark");
    expect(rendererDiv).not.toHaveClass("jsondoc-theme-light");
  });

  it("handles undefined theme prop gracefully", () => {
    const { container } = render(
      <JsonDocRenderer page={simplePage} theme={undefined} />
    );

    const rendererDiv = screen.getByTestId(JSON_DOC_ROOT_TEST_ID);
    expect(rendererDiv).toHaveClass("jsondoc-theme-light");
  });

  it("theme persists across different block types", () => {
    const { container } = render(
      <JsonDocRenderer page={mockPageWithAllBlocks} theme="dark" />
    );

    const rendererDiv = screen.getByTestId(JSON_DOC_ROOT_TEST_ID);
    expect(rendererDiv).toHaveClass("jsondoc-theme-dark");

    // Verify various block types are still rendered
    expect(screen.getByText("This is a paragraph with")).toBeInTheDocument();
    expect(screen.getByText("First bullet point")).toBeInTheDocument();
    expect(
      screen.getByText('console.log("Hello, World!");')
    ).toBeInTheDocument();
  });
});
