export type RichText = {
  [k: string]: unknown;
} & {
  type: "text" | "equation";
};
