export interface UploadResult {
  key: string; // Storage key/path
  url?: string; // Public URL (if available)
  size: number;
  mimeType: string;
}

export interface IStorageService {
  /**
   * Upload a file
   * @param file - File buffer or stream
   * @param options - Upload options (filename, path, etc.)
   */
  upload(file: Express.Multer.File, path?: string): Promise<UploadResult>;

  /**
   * Download a file
   * @param key - Storage key
   */
  download(key: string): Promise<Buffer>;

  /**
   * Delete a file
   * @param key - Storage key
   */
  delete(key: string): Promise<void>;

  /**
   * Get file URL
   * @param key - Storage key
   * @param expiresIn - Expiration time in seconds (for presigned URLs)
   */
  getUrl(key: string, expiresIn?: number): Promise<string>;

  /**
   * Check if file exists
   * @param key - Storage key
   */
  exists(key: string): Promise<boolean>;
}
