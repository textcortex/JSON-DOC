import React from 'react';
import { RichTextRenderer } from '../RichTextRenderer';
import { BlockRenderer } from '../BlockRenderer';

interface TableBlockRendererProps {
  block: any;
  depth?: number;
}

export const TableBlockRenderer: React.FC<TableBlockRendererProps> = ({ 
  block, 
  depth = 0 
}) => {
  const tableData = block.table;
  
  return (
    <div className="notion-selectable notion-table-block" data-block-id={block.id}>
      <div>
        <div>
          <div className="notion-scroller horizontal">
            <div className="notion-table-content">
              <table>
                <tbody>
                  {block.children?.map((child: any, index: number) => {
                    if (child?.type === 'table_row') {
                      const rowData = child.table_row;
                      const isHeader = index === 0 && tableData?.has_column_header;
                      
                      return (
                        <tr key={child.id || index} className="notion-table-row">
                          {rowData?.cells?.map((cell: any, cellIndex: number) => {
                            const CellTag = isHeader ? 'th' : 'td';
                            return (
                              <CellTag key={cellIndex} scope={isHeader ? 'col' : undefined}>
                                <div className="notion-table-cell">
                                  <div className="notion-table-cell-text notranslate">
                                    <RichTextRenderer richText={cell || []} />
                                  </div>
                                </div>
                              </CellTag>
                            );
                          })}
                        </tr>
                      );
                    }
                    return null;
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Render other children blocks recursively (non-table-row blocks) */}
      {block.children && block.children.length > 0 && (
        <div className="notion-block-children" style={{ marginLeft: `${depth * 24}px` }}>
          {block.children
            .filter((child: any) => child?.type !== 'table_row')
            .map((child: any, index: number) => (
              <BlockRenderer key={child.id || index} block={child} depth={depth + 1} />
            ))}
        </div>
      )}
    </div>
  );
};