import type { BlockBase } from "../../base";

export type Heading1Block = BlockBase & {
  type: "heading_1";
  heading_1: {
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
    is_toggleable?: boolean;
  };
};
