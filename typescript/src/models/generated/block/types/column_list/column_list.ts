import type { BlockBase } from "../../base";
import type { ColumnBlock } from "../column";

export type ColumnListBlock = BlockBase & {
  type: "column_list";
  column_list: {};
  children?: ColumnBlock[];
};
