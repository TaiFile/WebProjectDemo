import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService, UploadResult } from './storage.interface';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET');

    this.s3 = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.logger.log(`S3 Storage initialized for bucket: ${this.bucketName}`);
  }

  async upload(file: Express.Multer.File, customPath?: string): Promise<UploadResult> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const key = customPath ? `${customPath}/${fileName}` : fileName;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'private',
        }),
      );
      this.logger.log(`File uploaded to S3: ${key}`);

      return {
        key,
        url: undefined,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Failed to upload file to S3', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  async download(key: string): Promise<Buffer> {
    try {
      const result = await this.s3.send(
        new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
      );
      const body = result.Body as unknown as Buffer | Uint8Array | Blob | string;
      return Buffer.isBuffer(body) ? body : Buffer.from(body as any);
    } catch (error) {
      this.logger.error(`Failed to download file from S3: ${key}`, error);
      throw new Error(`File not found: ${key}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
      this.logger.log(`File deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${key}`, error);
      throw new Error(`Failed to delete file: ${key}`);
    }
  }

  async getUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const url = await getSignedUrl(
        this.s3,
        new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
        { expiresIn },
      );
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for: ${key}`, error);
      throw new Error('Failed to generate URL');
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.s3.send(new HeadObjectCommand({ Bucket: this.bucketName, Key: key }));
      return true;
    } catch {
      return false;
    }
  }
}
