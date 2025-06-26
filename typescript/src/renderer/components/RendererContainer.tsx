import React, { useEffect } from "react";

import { Page } from "@/models/generated";
import { loadPage } from "@/serialization/loader";

import { RendererProvider } from "../context/RendererContext";
import { useHighlights } from "../hooks/useHighlights";
import { Backref } from "../utils/highlightUtils";

import { HighlightNavigation } from "./HighlightNavigation";
import { JsonViewPanel } from "./dev/JsonViewPanel";
import { BlockRenderer } from "./BlockRenderer";
import { PageDelimiter } from "./PageDelimiter";

interface RendererContainerProps {
  page: Page;
  className?: string;
  components?: React.ComponentProps<typeof BlockRenderer>["components"] & {
    page_delimiter: React.ComponentType<{
      pageNumber: number;
    }>;
  };
  devMode?: boolean;
  resolveImageUrl?: (url: string) => Promise<string>;
  viewJson?: boolean;
  backrefs?: Backref[];
}

export const RendererContainer: React.FC<RendererContainerProps> = ({
  page,
  className = "",
  components,
  devMode = false,
  resolveImageUrl,
  viewJson = false,
  backrefs = [],
}) => {
  // Use the modular hooks for highlight management
  const { highlightCount, currentActiveIndex, navigateToHighlight } =
    useHighlights({
      backrefs,
    });

  useEffect(() => {
    try {
      //TODO: this is not throwing for invalid page object (one that doesn't follow schema)
      loadPage(page);
    } catch (_) {
      // console.log("error ", error);
    }
  }, [page]);

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
        <h1
          className="json-doc-page-title"
          data-page-id={page.id}
          role="heading"
        >
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
    <RendererProvider value={{ devMode, resolveImageUrl }}>
      <div className={`json-doc-renderer${className ? " " + className : ""}`}>
        {viewJson ? (
          <div className="flex h-screen">
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
  );
};
