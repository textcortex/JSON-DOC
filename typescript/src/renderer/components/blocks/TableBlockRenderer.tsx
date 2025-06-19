import React from "react";

import { TableBlock } from "@/models/generated";

import { RichTextRenderer } from "../RichTextRenderer";
import { BlockRenderer } from "../BlockRenderer";

interface TableBlockRendererProps extends React.HTMLAttributes<HTMLDivElement> {
  block: TableBlock;
  depth?: number;
  components?: React.ComponentProps<typeof BlockRenderer>["components"];
}

export const TableBlockRenderer: React.FC<TableBlockRendererProps> = ({
  block,
  depth = 0,
  className,
  components,
  ...props
}) => {
  const tableData = block.table;

  return (
    <div
      {...props}
      className={`notion-selectable notion-table-block${className ? ` ${className}` : ""}`}
      data-block-id={block.id}
    >
      <div className="notion-scroller horizontal">
        <div className="notion-table-content">
          <table>
            <tbody>
              {block.children?.map((child: any, index: number) => {
                if (child?.type === "table_row") {
                  const rowData = child.table_row;
                  const isHeader = index === 0 && tableData?.has_column_header;

                  return (
                    <tr
                      key={child.id || index}
                      className="notion-table-row"
                      data-block-id={child.id}
                    >
                      {rowData?.cells?.map((cell: any, cellIndex: number) => {
                        const CellTag = isHeader ? "th" : "td";
                        return (
                          <CellTag
                            key={cellIndex}
                            scope={isHeader ? "col" : undefined}
                          >
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
  );
};
