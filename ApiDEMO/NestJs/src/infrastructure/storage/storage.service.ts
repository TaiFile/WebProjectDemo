import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from './storage.interface';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';

/**
 * Storage Service Factory
 * Chooses between Local and S3 storage based on STORAGE_TYPE environment variable
 */
@Injectable()
export class StorageService implements IStorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly storageService: IStorageService;

  constructor(
    private configService: ConfigService,
    private localStorageService: LocalStorageService,
    private s3StorageService: S3StorageService,
  ) {
    const storageType = this.configService.get<string>('STORAGE_TYPE', 'local');

    if (storageType === 's3') {
      this.storageService = this.s3StorageService;
      this.logger.log('✅ Using S3 Storage');
    } else {
      this.storageService = this.localStorageService;
      this.logger.log('✅ Using Local Storage');
    }
  }

  async upload(file: Express.Multer.File, path?: string) {
    return this.storageService.upload(file, path);
  }

  async download(key: string) {
    return this.storageService.download(key);
  }

  async delete(key: string) {
    return this.storageService.delete(key);
  }

  async getUrl(key: string, expiresIn?: number) {
    return this.storageService.getUrl(key, expiresIn);
  }

  async exists(key: string) {
    return this.storageService.exists(key);
  }

  getStorageType(): 'local' | 's3' {
    const storageType = this.configService.get<string>('STORAGE_TYPE', 'local');
    return storageType === 's3' ? 's3' : 'local';
  }
}
