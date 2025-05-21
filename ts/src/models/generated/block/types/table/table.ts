export type TableBlock = BlockBase & {
  type: 'table';
  table: {
    table_width?: number;
    has_column_header: boolean;
    has_row_header: boolean;
  };
  children?: TableRowBlock[];
};
/**
 * Reference to block.base.BlockBase
 */
export type BlockBase = BlockBase;
/**
 * Reference to block.types.table_row.TableRowBlock
 */
export type TableRowBlock = TableRowBlock;
