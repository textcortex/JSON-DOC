import React, { useEffect, useRef } from "react";
import katex from "katex";

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && equationData?.expression) {
      try {
        katex.render(equationData.expression, containerRef.current, {
          displayMode: true,
          throwOnError: false,
          errorColor: '#cc0000',
          strict: 'warn'
        });
      } catch (error) {
        console.warn('KaTeX render error:', error);
        if (containerRef.current) {
          containerRef.current.textContent = equationData.expression;
        }
      }
    }
  }, [equationData?.expression]);

  return (
    <div
      {...props}
      className={`notion-selectable notion-equation-block${className ? ` ${className}` : ""}`}
      data-block-id={block.id}
    >
      <div>
        <div className="notion-equation-display">
          <div 
            className="notion-equation-content"
            ref={containerRef}
          />
        </div>
      </div>
    </div>
  );
};
