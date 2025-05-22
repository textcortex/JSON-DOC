import React from 'react';
import { RichTextRenderer } from '../RichTextRenderer';
import { BlockRenderer } from '../BlockRenderer';

interface ParagraphBlockRendererProps {
  block: any;
  depth?: number;
}

export const ParagraphBlockRenderer: React.FC<ParagraphBlockRendererProps> = ({ 
  block, 
  depth = 0 
}) => {
  return (
    <div className="notion-selectable notion-text-block" data-block-id={block.id}>
      <div>
        <div>
          <div className="notranslate">
            <RichTextRenderer richText={block.paragraph?.rich_text || []} />
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