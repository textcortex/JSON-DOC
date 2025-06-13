import React from "react";

import { EquationBlock } from "@/models/generated";

interface EquationBlockRendererProps
  extends React.HTMLAttributes<HTMLDivElement> {
  block: EquationBlock;
  depth?: number;
}

export const EquationBlockRenderer: React.FC<EquationBlockRendererProps> = ({
  block,
  className,
  ...props
}) => {
  const equationData = block.equation;

  return (
    <div
      {...props}
      className={`notion-selectable notion-equation-block${className ? ` ${className}` : ""}`}
      data-block-id={block.id}
    >
      <div>
        <div className="notion-equation-display">
          <div className="notion-equation-content">
            {equationData?.expression || ""}
          </div>
        </div>
      </div>
    </div>
  );
};
