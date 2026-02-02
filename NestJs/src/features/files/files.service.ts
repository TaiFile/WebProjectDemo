import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { FilesRepository, CreateFileData } from './repositories/files.repository';
import { FileResponseDto } from './dtos/file-response.dto';
import { UploadResponseDto } from './dtos/upload-response.dto';
import { StorageType } from '@prisma/client';
import { StorageService } from '@infrastructure/storage/storage.service';
import type { Express } from 'express';

@Injectable()
export class FilesService {
  constructor(
    private filesRepository: FilesRepository,
    private storageService: StorageService,
  ) {}
  async upload(userId: string, file: Express.Multer.File): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }

    const uploadResult = await this.storageService.upload(file);
    const storageTypeConfig = this.storageService.getStorageType();
    const storageType = storageTypeConfig === 's3' ? StorageType.S3 : StorageType.LOCAL;

    const createData: CreateFileData = {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storageType,
      storagePath: uploadResult.key,
      storageUrl: null,
      metadata: null,
      uploadedById: userId,
    };

    const created = await this.filesRepository.create(createData);

    return this.mapToUploadResponse(created);
  }

  async getFile(fileId: string, userId: string): Promise<FileResponseDto> {
    const file = await this.filesRepository.findById(fileId);

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    if (file.uploadedById !== userId) {
      throw new ForbiddenException('Você não tem permissão para acessar este arquivo');
    }

    return this.mapToFileResponse(file);
  }
  async listUserFiles(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;

    const { items, total } = await this.filesRepository.findWithPagination({
      skip,
      take: limit,
      userId,
    });

    return {
      files: items.map((file) => this.mapToFileResponse(file)),
      total,
      page,
      limit,
    };
  }

  private mapToUploadResponse(file: any): UploadResponseDto {
    return {
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      storageType: file.storageType,
      url: file.storageUrl ?? null,
      uploadedAt: file.createdAt,
      message: 'File uploaded successfully',
    };
  }

  private mapToFileResponse(file: any): FileResponseDto {
    return {
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      storageType: file.storageType,
      storagePath: file.storagePath,
      storageUrl: file.storageUrl ?? null,
      uploadedById: file.uploadedById,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }

  async getUserFiles(userId: string): Promise<FileResponseDto[]> {
    const files = await this.filesRepository.findByUserId(userId);
    return files.map((file) => this.mapToFileResponse(file));
  }

  async getFileById(id: string, userId: string): Promise<FileResponseDto> {
    return this.getFile(id, userId);
  }

  async download(id: string, userId: string): Promise<{ buffer: Buffer; file: FileResponseDto }> {
    const file = await this.filesRepository.findById(id);

    if (!file) throw new NotFoundException('Arquivo não encontrado');
    if (file.uploadedById !== userId) throw new ForbiddenException('Você não tem permissão');

    try {
      const buffer = await this.storageService.download(file.storagePath);
      return { buffer, file: this.mapToFileResponse(file) };
    } catch (error) {
      throw new InternalServerErrorException('Falha ao ler o arquivo do armazenamento');
    }
  }

  async getUrl(id: string, userId: string, expiresIn?: number) {
    const file = await this.filesRepository.findById(id);

    if (!file) throw new NotFoundException('Arquivo não encontrado');
    if (file.uploadedById !== userId) throw new ForbiddenException('Você não tem permissão');

    const url = await this.storageService.getUrl(file.storagePath);

    return {
      url,
      expiresIn,
    };
  }

  async delete(id: string, userId: string) {
    const file = await this.filesRepository.findById(id);

    if (!file) throw new NotFoundException('Arquivo não encontrado');
    if (file.uploadedById !== userId) throw new ForbiddenException('Você não tem permissão');

    try {
      await this.storageService.delete(file.storagePath);
      await this.filesRepository.delete(id);
      return { message: 'Arquivo deletado com sucesso' };
    } catch (error) {
      throw new InternalServerErrorException('Falha ao deletar o arquivo');
    }
  }
}
