import "./styles/index.css";
import React from "react";

import { Page } from "@/models/generated";
// import { validateAgainstSchema } from "@/validation/validator";

import { BlockRenderer } from "./components/BlockRenderer";
import { PageDelimiter } from "./components/PageDelimiter";
import { JsonViewPanel } from "./components/dev/JsonViewPanel";
import { RendererProvider } from "./context/RendererContext";
import { HighlightNavigation } from "./components/HighlightNavigation";
import { useHighlights } from "./hooks/useHighlights";
import { Backref } from "./utils/highlightUtils";
import { GlobalErrorBoundary } from "./components/ErrorBoundary";

interface JsonDocRendererProps {
  page: Page;
  className?: string;
  components?: React.ComponentProps<typeof BlockRenderer>["components"] & {
    page_delimiter: React.ComponentType<{
      pageNumber: number;
    }>;
  };
  theme?: "light" | "dark";
  resolveImageUrl?: (url: string) => Promise<string>;
  devMode?: boolean;
  viewJson?: boolean;
  backrefs?: Backref[];
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const JsonDocRenderer = ({
  page,
  className = "",
  components,
  theme = "light",
  resolveImageUrl,
  devMode = false,
  viewJson = false,
  backrefs = [],
  onError,
}: JsonDocRendererProps) => {
  // Use the modular hooks for highlight management
  const { highlightCount, currentActiveIndex, navigateToHighlight } =
    useHighlights({
      backrefs,
    });

  // return null;
  const renderedContent = (
    <div className="json-doc-page">
      {/* Page icon */}
      {page.icon && (
        <div className="json-doc-page-icon">
          {page.icon.type === "emoji" && page.icon.emoji}
        </div>
      )}
      {/* Page title */}
      {page.properties?.title && (
        <h1 className="json-doc-page-title">
          {page.properties.title.title?.[0]?.plain_text || "Untitled"}
        </h1>
      )}
      {/* Page children blocks */}
      {page.children && page.children.length > 0 && (
        <div className="json-doc-page-content">
          {page.children.map((block: any, index: number) => {
            const currentPageNum = block.metadata?.origin?.page_num;
            const nextPageNum =
              index < page.children.length - 1
                ? (page.children[index + 1]?.metadata as any)?.origin?.page_num
                : null;

            // Show delimiter after the last block of each page
            const showPageDelimiter =
              currentPageNum &&
              (nextPageNum !== currentPageNum ||
                index === page.children.length - 1);

            return (
              <React.Fragment key={block.id || index}>
                <BlockRenderer
                  block={block}
                  depth={0}
                  components={components}
                />

                {showPageDelimiter && !components?.page_delimiter && (
                  <PageDelimiter pageNumber={currentPageNum} />
                )}
                {showPageDelimiter && components?.page_delimiter && (
                  <components.page_delimiter pageNumber={currentPageNum} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className={`jsondoc-theme-${theme}`}>
      <GlobalErrorBoundary onError={onError}>
        <RendererProvider value={{ devMode, resolveImageUrl }}>
          <div className={`json-doc-renderer  ${className}`}>
            {viewJson ? (
              <div className="flex h-screen">
                <div className="w-1/2 overflow-y-auto">{renderedContent}</div>
                <JsonViewPanel data={page} />
              </div>
            ) : (
              renderedContent
            )}
            {/* Show highlight navigation when there are highlights */}
            {highlightCount > 0 && (
              <HighlightNavigation
                highlightCount={highlightCount}
                onNavigate={navigateToHighlight}
                currentIndex={currentActiveIndex}
              />
            )}
          </div>
        </RendererProvider>
      </GlobalErrorBoundary>
    </div>
  );
};
