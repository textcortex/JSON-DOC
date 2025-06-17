import { useEffect, useRef, useState } from "react";

import {
  Backref,
  HighlightElement,
  processBackref,
  sortHighlightsByDOMPosition,
  clearActiveHighlights,
  setActiveHighlight,
  logPerformanceStats,
  PerformanceStats,
} from "../utils/highlightUtils";

export interface UseHighlightsOptions {
  backrefs: Backref[];
  onPerformanceLog?: (stats: PerformanceStats) => void;
}

export interface UseHighlightsReturn {
  highlightElements: HighlightElement[];
  highlightCount: number;
  currentActiveIndex: number;
  navigateToHighlight: (index: number) => void;
  clearHighlights: () => void;
}

/**
 * Custom hook for managing text highlights in the document
 */
export function useHighlights({
  backrefs,
  onPerformanceLog,
}: UseHighlightsOptions): UseHighlightsReturn {
  const highlightElementsRef = useRef<HighlightElement[]>([]);
  const [currentActiveIndex, setCurrentActiveIndex] = useState(-1);
  const [highlightCount, setHighlightCount] = useState(0);

  // Clear all highlights and reset state
  const clearHighlights = () => {
    clearActiveHighlights(highlightElementsRef.current);
    highlightElementsRef.current = [];
    setCurrentActiveIndex(-1);
    setHighlightCount(0);
  };

  // Navigate to a specific highlight by index
  const navigateToHighlight = (index: number) => {
    const highlights = highlightElementsRef.current;

    if (index < 0 || index >= highlights.length) {
      return;
    }

    // Clear previous active highlight
    if (currentActiveIndex >= 0) {
      const prevItem = highlights[currentActiveIndex];
      if (prevItem?.element) {
        prevItem.element.classList.remove("active");
      }
    }

    // Set new active highlight
    setActiveHighlight(highlights, index);
    setCurrentActiveIndex(index);
  };

  // Process backrefs and create highlights
  useEffect(() => {
    if (backrefs.length === 0) {
      clearHighlights();
      return;
    }

    const startTime = performance.now();
    console.log(`🚀 Starting highlighting for ${backrefs.length} backrefs`);

    // Clear existing highlights
    clearHighlights();

    // Process each backref
    const newHighlights: HighlightElement[] = [];

    backrefs.forEach((backref, backrefIndex) => {
      const firstSpan = processBackref(backref);

      if (firstSpan) {
        newHighlights.push({
          element: firstSpan,
          backrefIndex,
        });
      }
    });

    // Sort highlights by DOM position for natural reading order
    const sortStartTime = performance.now();
    const sortedHighlights = sortHighlightsByDOMPosition(newHighlights);
    const sortTime = performance.now() - sortStartTime;

    // Update ref with sorted highlights
    highlightElementsRef.current = sortedHighlights;
    setHighlightCount(sortedHighlights.length);

    // Navigate to first highlight if there are any
    if (sortedHighlights.length > 0) {
      setActiveHighlight(sortedHighlights, 0);
      setCurrentActiveIndex(0);
    }

    // Calculate and log performance stats
    const totalTime = performance.now() - startTime;
    const stats: PerformanceStats = {
      totalTime,
      highlightCount: sortedHighlights.length,
      sortTime,
      avgTimePerHighlight: totalTime / backrefs.length,
    };

    if (onPerformanceLog) {
      onPerformanceLog(stats);
    } else {
      logPerformanceStats(stats);
    }
  }, [backrefs, onPerformanceLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHighlights();
    };
  }, []);

  return {
    highlightElements: highlightElementsRef.current,
    highlightCount,
    currentActiveIndex,
    navigateToHighlight,
    clearHighlights,
  };
}
