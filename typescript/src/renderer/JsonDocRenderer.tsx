import "./styles/index.css";
import React, { useEffect } from "react";

import { Page } from "@/models/generated";
// import { validateAgainstSchema } from "@/validation/validator";

import { BlockRenderer } from "./components/BlockRenderer";
import { PageDelimiter } from "./components/PageDelimiter";
import { JsonViewPanel } from "./components/dev/JsonViewPanel";
import { RendererProvider } from "./context/RendererContext";

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
}

export const JsonDocRenderer = ({
  page,
  className = "",
  components,
  theme = "light",
  resolveImageUrl,
  devMode = false,
  viewJson = false,
  // PageDelimiterComponent = PageDelimiter,
}: JsonDocRendererProps) => {
  console.log("page: ", page);

  const loadAndValidate = async () => {
    // const response = await fetch("/schema/page/page_schema.json"); // Updated path
    // const data = await response.json();
    // console.log("schema: ", data);
    // validateAgainstSchema(
    //   page,
    // )
  };

  useEffect(() => {
    console.log("in jsondocrendererrrr");
    loadAndValidate();
  }, []);

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
    <RendererProvider value={{ devMode, resolveImageUrl }}>
      <div className={`json-doc-renderer jsondoc-theme-${theme} ${className}`}>
        {viewJson ? (
          <div className="flex h-screen">
            <div className="w-1/2 overflow-y-auto">{renderedContent}</div>
            <JsonViewPanel data={page} />
          </div>
        ) : (
          renderedContent
        )}
      </div>
    </RendererProvider>
  );
};
