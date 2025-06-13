import type { BlockBase } from "../../base";
import type { Block } from "../..";

export type BulletedListItemBlock = BlockBase & {
  type: "bulleted_list_item";
  bulleted_list_item: {
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
