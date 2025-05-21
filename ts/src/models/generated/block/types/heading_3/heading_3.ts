export type Heading3Block = BlockBase & {
  type: 'heading_3';
  heading_3: {
    rich_text: {
      [k: string]: unknown;
    }[];
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
    is_toggleable?: boolean;
  };
};
/**
 * Reference to block.base.BlockBase
 */
export type BlockBase = BlockBase;
