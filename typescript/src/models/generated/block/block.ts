export type Block = {
  [k: string]: unknown;
} & {
  type:
    | "paragraph"
    | "to_do"
    | "bulleted_list_item"
    | "numbered_list_item"
    | "code"
    | "column"
    | "column_list"
    | "divider"
    | "equation"
    | "heading_1"
    | "heading_2"
    | "heading_3"
    | "image"
    | "quote"
    | "table"
    | "table_row"
    | "toggle";
};
