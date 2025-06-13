import type { BlockBase } from "../../base";
import type { Block } from "../..";

export type ColumnBlock = BlockBase & {
  type: "column";
  column: {};
  children?: Block[];
};
