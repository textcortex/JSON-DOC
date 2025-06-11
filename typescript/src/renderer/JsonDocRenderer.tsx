import "./styles/index.css";
import React from "react";

import { BlockRenderer } from "./components/BlockRenderer";

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
            {page.children.map((block: any, index: number) => (
              <BlockRenderer
                key={block.id || index}
                block={block}
                depth={0}
                components={components}
                resolveImageUrl={resolveImageUrl}
                devMode={devMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
