import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { JsonDocRenderer } from "../src/renderer/JsonDocRenderer";
import { mockBlocks, mockPageWithAllBlocks } from "./fixtures/test-blocks";

// Helper to create a page with specific blocks
const createPageWithBlocks = (blocks: any[]) => ({
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

describe("JsonDocRenderer - All Block Types", () => {
  it("renders page title correctly", () => {
    render(<JsonDocRenderer page={mockPageWithAllBlocks} />);

    expect(
      screen.getByText("Test Page with All Block Types")
    ).toBeInTheDocument();
  });

  it("paragraph renders block with rich text formatting", () => {
    const page = createPageWithBlocks([mockBlocks.paragraph]);
    render(<JsonDocRenderer page={page} />);

    expect(screen.getByText("This is a paragraph with")).toBeInTheDocument();
    expect(screen.getByText("bold text")).toBeInTheDocument();
    expect(screen.getByText("italic text")).toBeInTheDocument();
  });

  it("heading_1 renders block", () => {
    const page = createPageWithBlocks([mockBlocks.heading_1]);
    render(<JsonDocRenderer page={page} />);

    // screen.debug();

    expect(screen.getByText("Main Heading")).toBeInTheDocument();
  });

  it("heading_2 renders block", () => {
    const page = createPageWithBlocks([mockBlocks.heading_2]);
    render(<JsonDocRenderer page={page} />);

    expect(screen.getByText("Subheading")).toBeInTheDocument();
  });

  it("heading_3 renders block", () => {
    const page = createPageWithBlocks([mockBlocks.heading_3]);
    render(<JsonDocRenderer page={page} />);

    expect(screen.getByText("Sub-subheading")).toBeInTheDocument();
  });

  it("bulleted list item renders with nested children", () => {
    const page = createPageWithBlocks([mockBlocks.bulleted_list_item]);
    render(<JsonDocRenderer page={page} />);

    expect(screen.getByText("First bullet point")).toBeInTheDocument();
    expect(screen.getByText("Nested bullet point")).toBeInTheDocument();
  });

  it("renders numbered list item", () => {
    const page = createPageWithBlocks([mockBlocks.numbered_list_item]);
    render(<JsonDocRenderer page={page} />);

    expect(screen.getByText("First numbered item")).toBeInTheDocument();
  });

  it("renders code block with syntax highlighting", () => {
    const page = createPageWithBlocks([mockBlocks.code]);
    render(<JsonDocRenderer page={page} />);

    expect(
      screen.getByText('console.log("Hello, World!");')
    ).toBeInTheDocument();
  });

  it("renders image block with caption", () => {
    const page = createPageWithBlocks([mockBlocks.image]);
    render(<JsonDocRenderer page={page} />);

    expect(screen.getByText("Sample image caption")).toBeInTheDocument();
  });

  it("renders quote block", () => {
    const page = createPageWithBlocks([mockBlocks.quote]);
    render(<JsonDocRenderer page={page} />);

    expect(
      screen.getByText("This is an inspirational quote.")
    ).toBeInTheDocument();
  });

  it("renders divider block", () => {
    const page = createPageWithBlocks([mockBlocks.divider]);
    const { container } = render(<JsonDocRenderer page={page} />);

    expect(
      container.querySelector('[data-block-id="divider-1"]')
    ).toBeInTheDocument();
  });

  it("renders todo block", () => {
    const page = createPageWithBlocks([mockBlocks.to_do]);
    render(<JsonDocRenderer page={page} />);

    expect(screen.getByText("Complete this task")).toBeInTheDocument();
  });

  it("renders toggle block", () => {
    const page = createPageWithBlocks([mockBlocks.toggle]);
    render(<JsonDocRenderer page={page} />);

    expect(screen.getByText("Toggle block title")).toBeInTheDocument();
  });

  it("toggles content visibility when clicked", async () => {
    const user = userEvent.setup();
    const page = createPageWithBlocks([mockBlocks.toggle]);
    render(<JsonDocRenderer page={page} />);

    // Initially, toggle content might be hidden or visible depending on implementation
    const toggleArrowBtn = screen.getByRole("button");
    expect(toggleArrowBtn).toBeInTheDocument();

    // Check if content is initially visible or hidden
    const toggleContent = screen.queryByText("Hidden content inside toggle");
    const isInitiallyVisible = toggleContent !== null;

    // Click the toggle button/title
    await user.click(toggleArrowBtn);

    // After click, content visibility should change
    if (isInitiallyVisible) {
      // If initially visible, should now be hidden
      expect(
        screen.queryByText("Hidden content inside toggle")
      ).not.toBeInTheDocument();
    } else {
      // If initially hidden, should now be visible
      expect(
        screen.getByText("Hidden content inside toggle")
      ).toBeInTheDocument();
    }

    // Click again to toggle back
    await user.click(toggleArrowBtn);

    // Should return to initial state
    if (isInitiallyVisible) {
      expect(
        screen.getByText("Hidden content inside toggle")
      ).toBeInTheDocument();
    } else {
      expect(
        screen.queryByText("Hidden content inside toggle")
      ).not.toBeInTheDocument();
    }
  });

  it("renders table block with headers and cells", () => {
    const page = createPageWithBlocks([mockBlocks.table]);
    render(<JsonDocRenderer page={page} />);

    expect(screen.getByText("Header 1")).toBeInTheDocument();
    expect(screen.getByText("Header 2")).toBeInTheDocument();
    expect(screen.getByText("Cell 1")).toBeInTheDocument();
    expect(screen.getByText("Cell 2")).toBeInTheDocument();
  });

  it("renders column list block with content", () => {
    const page = createPageWithBlocks([mockBlocks.column_list]);
    render(<JsonDocRenderer page={page} />);

    expect(screen.getByText("Content in first column")).toBeInTheDocument();
    expect(screen.getByText("Content in second column")).toBeInTheDocument();
  });

  it("renders equation block", () => {
    const page = createPageWithBlocks([mockBlocks.equation]);
    const { container } = render(<JsonDocRenderer page={page} />);

    // KaTeX renders complex DOM, just check that equation block is present
    expect(
      container.querySelector('[data-block-id="equation-1"]')
    ).toBeInTheDocument();
  });

  it("renders text annotations (bold, italic, underline etc.) correctly", () => {
    const page = createPageWithBlocks([mockBlocks.paragraph]);
    const { container } = render(<JsonDocRenderer page={page} />);

    // Debug: Print the HTML structure
    // screen.debug();

    // Test bold annotation
    const boldText = screen.getByText("bold text");
    expect(boldText).toBeInTheDocument();
    expect(boldText.closest("strong")).toBeInTheDocument();

    // Test italic annotation
    const italicText = screen.getByText("italic text");
    expect(italicText).toBeInTheDocument();
    expect(italicText.closest("em")).toBeInTheDocument();

    // Test normal text without annotations
    expect(screen.getByText("This is a paragraph with")).toBeInTheDocument();
    expect(screen.getByText("and")).toBeInTheDocument();
  });

  it("renders all block types together successfully", () => {
    render(<JsonDocRenderer page={mockPageWithAllBlocks} />);

    // Verify page structure
    expect(
      screen.getByText("Test Page with All Block Types")
    ).toBeInTheDocument();

    // Sample of different block types to ensure they all render
    expect(screen.getByText("This is a paragraph with")).toBeInTheDocument();
    expect(screen.getByText("Main Heading")).toBeInTheDocument();
    expect(screen.getByText("First bullet point")).toBeInTheDocument();
    expect(
      screen.getByText('console.log("Hello, World!");')
    ).toBeInTheDocument();
    expect(screen.getByText("Sample image caption")).toBeInTheDocument();
    expect(screen.getByText("Complete this task")).toBeInTheDocument();
    expect(screen.getByText("Header 1")).toBeInTheDocument();
    expect(screen.getByText("Content in first column")).toBeInTheDocument();
  });
});
