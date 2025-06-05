export type FileImage = FileFile & {
  caption?: {
    [k: string]: unknown;
  }[];
};
/**
 * Reference to file.file.FileFile
 */
export type FileFile = FileFile;
