import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';

@Module({
  providers: [StorageService, LocalStorageService, S3StorageService],
  exports: [StorageService],
})
export class StorageModule {}
