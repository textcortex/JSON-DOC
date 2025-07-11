import React from "react";
import { ArrowUpIcon } from "@phosphor-icons/react/ArrowUp";
import { ArrowDownIcon } from "@phosphor-icons/react/ArrowDown";

import { useHighlightNavigation } from "../hooks/useHighlightNavigation";

interface HighlightNavigationProps {
  highlightCount: number;
  onNavigate: (index: number) => void;
  currentIndex?: number;
}

export const HighlightNavigation: React.FC<HighlightNavigationProps> = ({
  highlightCount,
  onNavigate,
  currentIndex: externalCurrentIndex,
}) => {
  const { currentIndex, navigatePrevious, navigateNext, hasHighlights } =
    useHighlightNavigation({
      highlightCount,
      onNavigate,
      externalCurrentIndex,
    });

  if (!hasHighlights) {
    return null;
  }

  return (
    <div className="json-doc-highlight-navigation">
      <div className="highlight-nav-content">
        <button
          className="highlight-nav-button"
          onClick={navigatePrevious}
          aria-label="Previous highlight"
          title="Previous highlight (↑/k)"
        >
          <ArrowUpIcon size={16} />
        </button>

        <span className="highlight-nav-counter">
          {currentIndex >= 0 ? currentIndex + 1 : "-"} of {highlightCount}
        </span>

        <button
          className="highlight-nav-button"
          onClick={navigateNext}
          aria-label="Next highlight"
          title="Next highlight (↓/j)"
        >
          <ArrowDownIcon size={16} />
        </button>
      </div>
    </div>
  );
};
