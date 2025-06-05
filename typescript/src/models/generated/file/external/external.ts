export interface FileExternal {
  type?: "external";
  external: {
    url: string;
  };
}
