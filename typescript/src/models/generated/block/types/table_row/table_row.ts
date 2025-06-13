import type { BlockBase } from "../../base";

export type TableRowBlock = BlockBase & {
  type: "table_row";
  table_row: {
    cells: {
      [k: string]: unknown;
    }[][];
  };
};
