import { useState, useEffect, useCallback } from "react";

export interface UseHighlightNavigationOptions {
  highlightCount: number;
  onNavigate: (index: number) => void;
  externalCurrentIndex?: number;
}

export interface UseHighlightNavigationReturn {
  currentIndex: number;
  navigatePrevious: () => void;
  navigateNext: () => void;
  navigateToIndex: (index: number) => void;
  hasHighlights: boolean;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
}

/**
 * Custom hook for managing highlight navigation state and controls
 */
export function useHighlightNavigation({
  highlightCount,
  onNavigate,
  externalCurrentIndex,
}: UseHighlightNavigationOptions): UseHighlightNavigationReturn {
  const [internalCurrentIndex, setInternalCurrentIndex] = useState(-1);

  // Use external index if provided, otherwise use internal
  const currentIndex = externalCurrentIndex ?? internalCurrentIndex;

  // Initialize to first highlight when highlights are available
  useEffect(() => {
    if (
      highlightCount > 0 &&
      externalCurrentIndex === undefined &&
      internalCurrentIndex === -1
    ) {
      setInternalCurrentIndex(0);
      onNavigate(0);
    }
  }, [highlightCount, externalCurrentIndex, internalCurrentIndex, onNavigate]);

  // Navigate to previous highlight (wraps around)
  const navigatePrevious = useCallback(() => {
    if (highlightCount === 0) return;

    const newIndex = currentIndex > 0 ? currentIndex - 1 : highlightCount - 1;

    if (externalCurrentIndex === undefined) {
      setInternalCurrentIndex(newIndex);
    }

    onNavigate(newIndex);
  }, [currentIndex, highlightCount, onNavigate, externalCurrentIndex]);

  // Navigate to next highlight (wraps around)
  const navigateNext = useCallback(() => {
    if (highlightCount === 0) return;

    const newIndex = currentIndex < highlightCount - 1 ? currentIndex + 1 : 0;

    if (externalCurrentIndex === undefined) {
      setInternalCurrentIndex(newIndex);
    }

    onNavigate(newIndex);
  }, [currentIndex, highlightCount, onNavigate, externalCurrentIndex]);

  // Navigate to specific index
  const navigateToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= highlightCount) return;

      if (externalCurrentIndex === undefined) {
        setInternalCurrentIndex(index);
      }

      onNavigate(index);
    },
    [highlightCount, onNavigate, externalCurrentIndex]
  );

  return {
    currentIndex,
    navigatePrevious,
    navigateNext,
    navigateToIndex,
    hasHighlights: highlightCount > 0,
    canNavigatePrevious: highlightCount > 0,
    canNavigateNext: highlightCount > 0,
  };
}
