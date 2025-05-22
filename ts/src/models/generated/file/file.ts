export type File = {
  [k: string]: unknown;
} & {
  type: "external" | "file";
};
