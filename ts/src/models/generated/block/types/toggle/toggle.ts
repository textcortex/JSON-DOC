export type ToggleBlock = BlockBase & {
  type: "toggle";
  toggle: {
    rich_text: {
      [k: string]: unknown;
    }[];
    color?:
      | "blue"
      | "blue_background"
      | "brown"
      | "brown_background"
      | "default"
      | "gray"
      | "gray_background"
      | "green"
      | "green_background"
      | "orange"
      | "orange_background"
      | "yellow"
      | "pink"
      | "pink_background"
      | "purple"
      | "purple_background"
      | "red"
      | "red_background"
      | "yellow_background";
  };
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
