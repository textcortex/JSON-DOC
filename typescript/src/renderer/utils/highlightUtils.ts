export interface Backref {
  end_idx: number;
  start_idx: number;
  block_id?: string;
  page_id?: string;
}

export interface HighlightElement {
  element: HTMLSpanElement;
  backrefIndex: number;
}

/**
 * Creates a highlight span element with the given text content
 */
export function createHighlightSpan(text: string): HTMLSpanElement {
  const highlightSpan = document.createElement("span");
  highlightSpan.className = "json-doc-highlight";
  highlightSpan.textContent = text;
  return highlightSpan;
}

/**
 * Finds all text nodes within a given element using TreeWalker
 */
export function getTextNodes(element: Element): Text[] {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  const textNodes: Text[] = [];
  let node: Node | null;

  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }

  return textNodes;
}

/**
 * Applies highlighting to a single text node based on the backref range
 */
export function highlightTextNode(
  textNode: Text,
  backref: Backref,
  currentIndex: number
): HTMLSpanElement | null {
  const nodeLength = textNode.textContent?.length || 0;
  const nodeStart = currentIndex;
  const nodeEnd = currentIndex + nodeLength;

  // Check if this text node overlaps with the backref range
  if (backref.start_idx < nodeEnd && backref.end_idx > nodeStart) {
    const highlightStart = Math.max(0, backref.start_idx - nodeStart);
    const highlightEnd = Math.min(nodeLength, backref.end_idx - nodeStart);

    if (highlightStart < highlightEnd) {
      const textContent = textNode.textContent || "";
      const beforeText = textContent.slice(0, highlightStart);
      const highlightedText = textContent.slice(highlightStart, highlightEnd);
      const afterText = textContent.slice(highlightEnd);

      const fragment = document.createDocumentFragment();

      // Add text before highlight
      if (beforeText) {
        fragment.appendChild(document.createTextNode(beforeText));
      }

      // Add highlighted text
      let highlightSpan: HTMLSpanElement | null = null;
      if (highlightedText) {
        highlightSpan = createHighlightSpan(highlightedText);
        fragment.appendChild(highlightSpan);
      }

      // Add text after highlight
      if (afterText) {
        fragment.appendChild(document.createTextNode(afterText));
      }

      // Replace the original text node with the fragment
      textNode.parentNode?.replaceChild(fragment, textNode);

      return highlightSpan;
    }
  }

  return null;
}

/**
 * Processes a single backref and applies highlighting to the target block or page title
 */
export function processBackref(backref: Backref): HTMLSpanElement | null {
  // If page_id is provided, target the page title
  if (backref.page_id) {
    return processPageTitleBackref(backref);
  }

  // Otherwise, handle block highlighting as before
  if (!backref.block_id) {
    return null;
  }

  const blockElement = document.querySelector(
    `[data-block-id="${backref.block_id}"]`
  );

  if (!blockElement) {
    return null;
  }

  const textNodes = getTextNodes(blockElement);
  let currentIndex = 0;
  let firstSpanForThisBackref: HTMLSpanElement | null = null;

  for (const textNode of textNodes) {
    const highlightSpan = highlightTextNode(textNode, backref, currentIndex);

    if (highlightSpan && !firstSpanForThisBackref) {
      firstSpanForThisBackref = highlightSpan;
    }

    currentIndex += textNode.textContent?.length || 0;
  }

  return firstSpanForThisBackref;
}

/**
 * Processes a backref that targets a page title
 */
export function processPageTitleBackref(
  backref: Backref
): HTMLSpanElement | null {
  // Find the specific page title element using data-page-id
  const pageTitleElement = document.querySelector(
    `[data-page-id="${backref.page_id}"]`
  );

  if (!pageTitleElement) {
    return null;
  }

  const textNodes = getTextNodes(pageTitleElement);
  let currentIndex = 0;
  let firstSpanForThisBackref: HTMLSpanElement | null = null;

  for (const textNode of textNodes) {
    const highlightSpan = highlightTextNode(textNode, backref, currentIndex);

    if (highlightSpan && !firstSpanForThisBackref) {
      firstSpanForThisBackref = highlightSpan;
    }

    currentIndex += textNode.textContent?.length || 0;
  }

  return firstSpanForThisBackref;
}

/**
 * Sorts highlight elements by their DOM position (reading order)
 */
export function sortHighlightsByDOMPosition(
  highlights: HighlightElement[]
): HighlightElement[] {
  return highlights.sort((a, b) => {
    const position = a.element.compareDocumentPosition(b.element);

    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    }

    return 0;
  });
}

/**
 * Removes all active classes from highlight elements
 */
export function clearActiveHighlights(highlights: HighlightElement[]): void {
  highlights.forEach((item) => {
    if (item?.element) {
      item.element.classList.remove("active");
    }
  });
}

/**
 * Sets the active class on a specific highlight element
 */
export function setActiveHighlight(
  highlights: HighlightElement[],
  index: number
): void {
  const item = highlights[index];
  if (item?.element) {
    item.element.classList.add("active");
    item.element.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }
}

/**
 * Performance measurement utilities
 */
export interface PerformanceStats {
  totalTime: number;
  highlightCount: number;
  sortTime: number;
  avgTimePerHighlight: number;
}

export function logPerformanceStats(stats: PerformanceStats): void {
  console.log(`✅ Highlighting complete!`);
  console.log(`📊 Performance stats:`);
  console.log(`   - Total time: ${stats.totalTime.toFixed(2)}ms`);
  console.log(`   - Highlights created: ${stats.highlightCount}`);
  console.log(`   - DOM sorting time: ${stats.sortTime.toFixed(2)}ms`);
  console.log(
    `   - Avg time per highlight: ${stats.avgTimePerHighlight.toFixed(2)}ms`
  );
}
