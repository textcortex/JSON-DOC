import "./styles/index.css";
import React from "react";

import { Page } from "@/models/generated";

import { BlockRenderer } from "./components/BlockRenderer";
import { RendererContainer } from "./components/RendererContainer";
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
  console.log("theme: ", theme);
  return (
    <div
      className={`jsondoc-theme-${theme}`}
      data-testid="jsondoc-renderer-root"
    >
      <GlobalErrorBoundary onError={onError}>
        <RendererContainer
          page={page}
          className={className}
          components={components}
          devMode={devMode}
          resolveImageUrl={resolveImageUrl}
          viewJson={viewJson}
          backrefs={backrefs}
        />
      </GlobalErrorBoundary>
    </div>
  );
};
