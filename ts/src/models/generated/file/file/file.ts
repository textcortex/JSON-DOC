export interface FileFile {
  type?: 'file';
  file: {
    url: string;
    expiry_time?: string;
  };
}
