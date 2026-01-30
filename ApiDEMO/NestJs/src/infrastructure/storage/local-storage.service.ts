import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IStorageService, UploadResult } from './storage.interface';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadPath: string;

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('UPLOAD_PATH', './uploads');
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.mkdir(this.uploadPath, { recursive: true });
      this.logger.log(`Upload directory ready: ${this.uploadPath}`);
    } catch (error) {
      this.logger.error('Failed to create upload directory', error);
    }
  }

  async upload(file: Express.Multer.File, customPath?: string): Promise<UploadResult> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = customPath
      ? path.join(this.uploadPath, customPath, fileName)
      : path.join(this.uploadPath, fileName);

    // Ensure subdirectory exists
    const directory = path.dirname(filePath);
    await fs.mkdir(directory, { recursive: true });

    // Write file
    await fs.writeFile(filePath, file.buffer);

    this.logger.log(`File uploaded locally: ${filePath}`);

    return {
      key: filePath,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async download(key: string): Promise<Buffer> {
    try {
      const buffer = await fs.readFile(key);
      return buffer;
    } catch (error) {
      this.logger.error(`Failed to download file: ${key}`, error);
      throw new Error(`File not found: ${key}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(key);
      this.logger.log(`File deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${key}`, error);
      throw new Error(`Failed to delete file: ${key}`);
    }
  }

  async getUrl(key: string): Promise<string> {
    // For local storage, we return the file path
    // In a real app, this would be an HTTP URL served by the app
    return key;
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(key);
      return true;
    } catch {
      return false;
    }
  }
}
