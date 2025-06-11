import "./styles/index.css";
import React from "react";

import { BlockRenderer } from "./components/BlockRenderer";
import { PageDelimiter } from "./components/PageDelimiter";
import { RendererProvider } from "./context/RendererContext";

interface JsonDocRendererProps {
  page: any;
  className?: string;
  components?: React.ComponentProps<typeof BlockRenderer>["components"];
  theme?: "light" | "dark";
  resolveImageUrl?: (url: string) => Promise<string>;
  devMode?: boolean;
}

export const JsonDocRenderer = ({
  page,
  className = "",
  components,
  theme = "light",
  resolveImageUrl,
  devMode = false,
}: JsonDocRendererProps) => {
  return (
    <RendererProvider value={{ devMode, resolveImageUrl }}>
      <div className={`json-doc-renderer jsondoc-theme-${theme} ${className}`}>
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
                    ? page.children[index + 1]?.metadata?.origin?.page_num
                    : null;

                // Show delimiter after the last block of each page
                const showPageDelimiter =
                  currentPageNum && 
                  (nextPageNum !== currentPageNum || index === page.children.length - 1);

                return (
                  <React.Fragment key={block.id || index}>
                    <BlockRenderer
                      block={block}
                      depth={0}
                      components={components}
                    />
                    {showPageDelimiter && (
                      <PageDelimiter pageNumber={currentPageNum} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </RendererProvider>
  );
};
