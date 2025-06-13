import type { FileExternal } from "../../../../file/external";

export type ExternalImage = FileExternal & {
  caption?: {
    [k: string]: unknown;
  }[];
};
