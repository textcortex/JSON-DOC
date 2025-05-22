import React, { useState } from 'react';
import { RichTextRenderer } from '../RichTextRenderer';
import { BlockRenderer } from '../BlockRenderer';

interface ToggleBlockRendererProps {
  block: any;
  depth?: number;
}

export const ToggleBlockRenderer: React.FC<ToggleBlockRendererProps> = ({ 
  block, 
  depth = 0 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleData = block.toggle;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notion-selectable notion-toggle-block" data-block-id={block.id}>
      <div>
        <div className="notion-list-item-box-left">
          <div 
            aria-expanded={isOpen} 
            aria-label={isOpen ? "Close" : "Open"} 
            role="button" 
            tabIndex={0}
            onClick={handleToggle}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggle();
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <svg 
              aria-hidden="true" 
              className="arrowCaretDownFillSmall" 
              role="graphics-symbol"
              viewBox="0 0 16 16"
              style={{ 
                width: 16, 
                height: 16,
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              <path d="M6 12l6-6H6z" fill="currentColor" />
            </svg>
          </div>
        </div>
        <div>
          <div>
            <div className="notranslate">
              <RichTextRenderer richText={toggleData?.rich_text || []} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Render children blocks recursively when toggle is open */}
      {isOpen && block.children && block.children.length > 0 && (
        <div className="notion-block-children" style={{ marginLeft: `${depth * 24}px` }}>
          {block.children.map((child: any, index: number) => (
            <BlockRenderer key={child.id || index} block={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};