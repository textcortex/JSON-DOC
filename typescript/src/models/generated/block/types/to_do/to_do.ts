export type ToDoBlock = BlockBase & {
  type: 'to_do';
  to_do: {
    rich_text: {
      [k: string]: unknown;
    }[];
    checked: boolean;
    color?:
      | 'blue'
      | 'blue_background'
      | 'brown'
      | 'brown_background'
      | 'default'
      | 'gray'
      | 'gray_background'
      | 'green'
      | 'green_background'
      | 'orange'
      | 'orange_background'
      | 'yellow'
      | 'pink'
      | 'pink_background'
      | 'purple'
      | 'purple_background'
      | 'red'
      | 'red_background'
      | 'yellow_background';
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
