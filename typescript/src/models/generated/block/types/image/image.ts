export type ImageBlock = BlockBase & {
  type: "image";
  image: {
    [k: string]: unknown;
  };
};
/**
 * Reference to block.base.BlockBase
 */
export type BlockBase = BlockBase;
