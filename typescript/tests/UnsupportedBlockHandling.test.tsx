import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { JsonDocRenderer } from "../src/renderer/JsonDocRenderer";
import { mockBlocks } from "./fixtures/test-blocks";

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

describe("Unsupported Block Handling", () => {
  // Mock console.warn to test logging behavior
  const originalConsoleWarn = console.warn;
  beforeEach(() => {
    console.warn = vi.fn();
  });
  afterEach(() => {
    console.warn = originalConsoleWarn;
  });

  const warningMsg = expect.stringMatching(/Unsupported block type:/);

  it("renders fallback UI for unsupported block types", () => {
    const page = createPageWithBlocks([mockBlocks.unsupported_with_content]);
    const { container } = render(<JsonDocRenderer page={page} />);

    // Should still render fallback UI regardless of block content
    expect(
      screen.getByText(/Unsupported block type: ai_block/)
    ).toBeInTheDocument();

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders unsupported blocks with children gracefully", () => {
    const page = createPageWithBlocks([mockBlocks.unsupported_with_children]);
    const { container } = render(<JsonDocRenderer page={page} />);

    // Should show fallback for the unsupported parent block
    expect(
      screen.getByText(/Unsupported block type: template_block/)
    ).toBeInTheDocument();

    expect(
      container.querySelector('[data-block-type="template_block"]')
    ).toBeInTheDocument();

    // Children should not be rendered within unsupported block fallback
    expect(
      screen.queryByText(/Content inside unsupported block/)
    ).not.toBeInTheDocument();
  });

  it("handles multiple unsupported blocks without breaking renderer", () => {
    const page = createPageWithBlocks([
      mockBlocks.unsupported_single,
      mockBlocks.paragraph, // Mix with supported block
      mockBlocks.unsupported_with_content,
      mockBlocks.heading_1, // Another supported block
      mockBlocks.unsupported_with_children,
    ]);
    const { container } = render(<JsonDocRenderer page={page} />);

    // All unsupported blocks should have fallback UI
    expect(
      screen.getByText(/Unsupported block type: custom_widget/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Unsupported block type: ai_block/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Unsupported block type: template_block/)
    ).toBeInTheDocument();

    // Supported blocks should still render normally
    expect(screen.getByText(/This is a paragraph with/)).toBeInTheDocument();
    expect(screen.getByText(/Main Heading/)).toBeInTheDocument();

    // Check all unsupported blocks have correct CSS class
    expect(screen.getAllByRole("alert")).toHaveLength(3);

    // Verify all warnings were logged
    expect(console.warn).toHaveBeenCalledTimes(3);
    expect(console.warn).toHaveBeenCalledWith(warningMsg, "custom_widget");
    expect(console.warn).toHaveBeenCalledWith(warningMsg, "ai_block");
    expect(console.warn).toHaveBeenCalledWith(warningMsg, "template_block");
  });
});
