export type ColumnBlock = BlockBase & {
  type: "column";
  column: {};
  children?: Block[];
};
/**
 * Reference to block.base.BlockBase
 */
export type BlockBase = BlockBase;
/**
 * Reference to jsondoc.models.block.base.BlockBase
 */
export type Block = BlockBase;
