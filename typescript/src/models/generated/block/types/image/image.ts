import type { BlockBase } from "../../base";

export type ImageBlock = BlockBase & {
  type: "image";
  image: {
    [k: string]: unknown;
  };
};
