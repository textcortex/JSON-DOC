import React from "react";

interface PageDelimiterProps {
  pageNumber: number;
  className?: string;
}

export const PageDelimiter: React.FC<PageDelimiterProps> = ({
  pageNumber,
  className,
}) => {
  return (
    <div className={`jsondoc-page-delimiter ${className || ""}`.trim()}>
      <div className="jsondoc-page-delimiter-line">
        <span className="jsondoc-page-number">
          Page {pageNumber}
        </span>
      </div>
    </div>
  );
};