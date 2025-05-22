export type ColumnListBlock = BlockBase & {
  type: "column_list";
  column_list: {};
  children?: ColumnBlock[];
};
/**
 * Reference to block.base.BlockBase
 */
export type BlockBase = BlockBase;
/**
 * Reference to block.types.column.ColumnBlock
 */
export type ColumnBlock = ColumnBlock;
