import React from 'react';
import { RichTextRenderer } from '../RichTextRenderer';
import { BlockRenderer } from '../BlockRenderer';

interface ToDoBlockRendererProps {
  block: any;
  depth?: number;
}

export const ToDoBlockRenderer: React.FC<ToDoBlockRendererProps> = ({ 
  block, 
  depth = 0 
}) => {
  const todoData = block.to_do;
  const isChecked = todoData?.checked || false;

  return (
    <div className="notion-selectable notion-to_do-block" data-block-id={block.id}>
      <div>
        <div className="notion-list-item-box-left">
          <div className="pseudoHover pseudoActive">
            <div aria-hidden="true">
              <svg 
                aria-hidden="true" 
                className={isChecked ? "check" : "checkboxSquare"} 
                role="graphics-symbol"
                viewBox="0 0 16 16"
                style={{ width: 16, height: 16 }}
              >
                {isChecked ? (
                  <path d="M13.5 2.5l-7 7-3.5-3.5-1.5 1.5 5 5 8.5-8.5z" fill="currentColor" />
                ) : (
                  <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1" />
                )}
              </svg>
            </div>
            <input 
              type="checkbox" 
              checked={isChecked}
              readOnly
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
            />
          </div>
        </div>
        <div>
          <div>
            <div className="notranslate">
              <RichTextRenderer richText={todoData?.rich_text || []} />
            </div>
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