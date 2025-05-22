import React from 'react';

interface RichTextRendererProps {
  richText: any[];
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ richText }) => {
  if (!richText || richText.length === 0) {
    return null;
  }

  return (
    <>
      {richText.map((item: any, index: number) => {
        const key = `rich-text-${index}`;
        
        if (item?.type === 'text') {
          const { text, annotations, href } = item;
          const content = text?.content || '';
          
          if (!content) return null;
          
          let element = <span key={key}>{content}</span>;
          
          // Apply text formatting
          if (annotations) {
            if (annotations.bold) {
              element = <strong key={key}>{element}</strong>;
            }
            if (annotations.italic) {
              element = <em key={key}>{element}</em>;
            }
            if (annotations.strikethrough) {
              element = <del key={key}>{element}</del>;
            }
            if (annotations.underline) {
              element = <u key={key}>{element}</u>;
            }
            if (annotations.code) {
              element = <code key={key} className="notion-inline-code">{content}</code>;
            }
            if (annotations.color && annotations.color !== 'default') {
              element = (
                <span key={key} className={`notion-text-color-${annotations.color}`}>
                  {element}
                </span>
              );
            }
          }
          
          // Handle links
          if (href) {
            element = (
              <a key={key} href={href} className="notion-link" target="_blank" rel="noopener noreferrer">
                {element}
              </a>
            );
          }
          
          return element;
        }
        
        if (item?.type === 'equation') {
          return (
            <span key={key} className="notion-equation">
              {item.equation?.expression || ''}
            </span>
          );
        }
        
        return null;
      })}
    </>
  );
};