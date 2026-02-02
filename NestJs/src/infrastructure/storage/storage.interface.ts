export interface UploadResult {
  key: string;
  url?: string;
  size: number;
  mimeType: string;
}

export interface IStorageService {
  upload(file: Express.Multer.File, path?: string): Promise<UploadResult>;

  download(key: string): Promise<Buffer>;

  delete(key: string): Promise<void>;

  getUrl(key: string, expiresIn?: number): Promise<string>;

  exists(key: string): Promise<boolean>;
}
