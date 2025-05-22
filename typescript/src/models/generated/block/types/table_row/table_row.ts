export type TableRowBlock = BlockBase & {
  type: 'table_row';
  table_row: {
    cells: {
      [k: string]: unknown;
    }[][];
  };
};
/**
 * Reference to block.base.BlockBase
 */
export type BlockBase = BlockBase;
