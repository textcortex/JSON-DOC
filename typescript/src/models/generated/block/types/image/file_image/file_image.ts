export type FileImage = FileFile & {
  caption?: {
    [k: string]: unknown;
  }[];
};

export interface FileFile {}
