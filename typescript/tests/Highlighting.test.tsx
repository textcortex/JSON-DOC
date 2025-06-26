import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, act, within } from "@testing-library/react";
import React from "react";

import { JsonDocRenderer } from "../src/renderer/JsonDocRenderer";
import { mockPageWithAllBlocks } from "./fixtures/test-blocks";
import { Backref } from "../src/renderer/utils/highlightUtils";

describe("JsonDocRenderer Highlighting", () => {
  it("creates highlights when backrefs are provided", async () => {
    const paragraphBackref = {
      start_idx: 4,
      end_idx: 40,
      block_id: "para-1",
    };

    const headingBackref = {
      start_idx: 0,
      end_idx: 4,
      block_id: "h1-1",
    };

    const backrefs: Backref[] = [paragraphBackref, headingBackref];

    const { container } = render(
      <JsonDocRenderer page={mockPageWithAllBlocks} backrefs={backrefs} />
    );

    // Wait for highlights to be processed
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // // Check that highlight spans are created
    const highlights = within(container).getAllByRole("note");
    expect(highlights.length).toBeGreaterThan(0);

    screen.debug();

    const paragraphEl = container.querySelector(
      `[data-block-id=${paragraphBackref.block_id}]`
    );
    expect(paragraphEl).toBeInTheDocument();

    const headingEl = container.querySelector(
      `[data-block-id=${headingBackref.block_id}]`
    );
    expect(headingEl).toBeInTheDocument();

    const combinedElText =
      (paragraphEl?.textContent || "") + " " + (headingEl?.textContent || "");

    highlights.forEach((item) => {
      expect(item.textContent?.length).toBeGreaterThan(0);
      if (item.textContent)
        expect(combinedElText.includes(item.textContent)).toBeTruthy();
    });
  });

  it("highlights page title when page_id backref is provided", async () => {
    const firstBackref = {
      start_idx: 0,
      end_idx: 4,
      page_id: mockPageWithAllBlocks.id,
    };
    const backrefs: Backref[] = [firstBackref];

    const { container } = render(
      <JsonDocRenderer page={mockPageWithAllBlocks} backrefs={backrefs} />
    );

    // Wait for highlights to be processed
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Check that highlight spans are created in the page title
    const pageTitle = within(container).getAllByRole("heading")[0];
    const highlightsInTitle = within(pageTitle).getAllByRole("note");

    expect(highlightsInTitle.length).toBeGreaterThan(0);

    const content =
      mockPageWithAllBlocks.properties.title.title[0].text.content;
    const textToHighlight = content.slice(
      firstBackref.start_idx,
      firstBackref.end_idx
    );

    expect(highlightsInTitle[0]).toHaveTextContent(textToHighlight);
  });

  it("handles invalid backrefs gracefully", async () => {
    const backrefs: Backref[] = [
      { start_idx: 0, end_idx: 4, block_id: "non-existent" },
      { start_idx: 99, end_idx: 1, block_id: "para-1" },
    ];

    const { container } = render(
      <JsonDocRenderer page={mockPageWithAllBlocks} backrefs={backrefs} />
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const highlights = within(container).queryAllByRole("note");

    // No highlights should be created
    expect(highlights.length).equals(0);
  });
});
