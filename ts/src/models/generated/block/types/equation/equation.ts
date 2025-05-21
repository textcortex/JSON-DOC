export type EquationBlock = BlockBase & {
  type: "equation";
  equation: {
    expression: string;
  };
};
/**
 * Reference to block.base.BlockBase
 */
export type BlockBase = BlockBase;
