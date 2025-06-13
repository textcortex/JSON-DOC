import React from "react";

import { DividerBlock } from "@/models/generated";

import { BlockRenderer } from "../BlockRenderer";

interface DividerBlockRendererProps
  extends React.HTMLAttributes<HTMLDivElement> {
  block: DividerBlock;
  depth?: number;
  components?: React.ComponentProps<typeof BlockRenderer>["components"];
}

export const DividerBlockRenderer: React.FC<DividerBlockRendererProps> = ({
  block,
  className,
  ...props
}) => {
  return (
    <div
      {...props}
      className={`notion-selectable notion-divider-block${className ? ` ${className}` : ""}`}
      data-block-id={block.id}
    >
      <div className="notion-cursor-default">
        <div role="separator"></div>
      </div>
    </div>
  );
};
