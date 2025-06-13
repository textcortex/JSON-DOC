import type { BlockBase } from "../../base";
import type { TableRowBlock } from "../table_row";

export type TableBlock = BlockBase & {
  type: "table";
  table: {
    table_width?: number;
    has_column_header: boolean;
    has_row_header: boolean;
  };
  children?: TableRowBlock[];
};
