import React from 'react';
import { BlockRenderer } from '../BlockRenderer';

interface EquationBlockRendererProps {
  block: any;
  depth?: number;
}

export const EquationBlockRenderer: React.FC<EquationBlockRendererProps> = ({ 
  block, 
  depth = 0 
}) => {
  const equationData = block.equation;

  return (
    <div className="notion-selectable notion-equation-block" data-block-id={block.id}>
      <div>
        <div className="notion-equation-display">
          <div className="notion-equation-content">
            {equationData?.expression || ''}
          </div>
        </div>
      </div>
      
      {/* Render children blocks recursively */}
      {block.children && block.children.length > 0 && (
        <div className="notion-block-children" style={{ marginLeft: `${depth * 24}px` }}>
          {block.children.map((child: any, index: number) => (
            <BlockRenderer key={child.id || index} block={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};