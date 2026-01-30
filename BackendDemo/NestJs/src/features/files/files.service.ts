import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { FilesRepository, CreateFileData } from './repositories/files.repository';
import { FileResponseDto, UploadResponseDto } from './dtos';
import { StorageType } from '@prisma/client';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import type { Express } from 'express';

@Injectable()
export class FilesService {
  constructor(private filesRepository: FilesRepository) {}

  /**
   * Upload de arquivo
   *
   * Lógica:
   * - Validar tamanho (implementado no interceptor)
   * - Criar registro no banco
   * - Retornar informações do arquivo
   */
  async upload(userId: string, file: Express.Multer.File): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }

    const storagePath = file.path ?? path.join('uploads', uuid());

    const createData: CreateFileData = {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storageType: StorageType.LOCAL,
      storagePath,
      storageUrl: null,
      metadata: null,
      uploadedById: userId,
    };

    const created = await this.filesRepository.create(createData);

    return this.mapToUploadResponse(created);
  }

  /**
   * Obter arquivo do usuário
   *
   * Lógica:
   * - Validar que arquivo existe
   * - Validar que arquivo pertence ao usuário
   * - Retornar dados do arquivo
   */
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

  /**
   * Deletar arquivo do usuário
   *
   * Lógica:
   * - Validar que arquivo existe
   * - Validar que arquivo pertence ao usuário
   * - Deletar arquivo
   */
  async deleteFile(fileId: string, userId: string): Promise<{ message: string }> {
    const file = await this.filesRepository.findById(fileId);

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    if (file.uploadedById !== userId) {
      throw new ForbiddenException('Você não tem permissão para deletar este arquivo');
    }

    await this.filesRepository.delete(fileId);

    return { message: 'Arquivo deletado com sucesso' };
  }

  /**
   * Listar arquivos do usuário
   */
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

  /**
   * Mapeia entidade para DTO de upload
   */
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
      const buffer = await fs.readFile(file.storagePath);
      return { buffer, file: this.mapToFileResponse(file) };
    } catch (error) {
      throw new InternalServerErrorException('Falha ao ler o arquivo do armazenamento');
    }
  }

  async getUrl(id: string, userId: string, expiresIn?: number) {
    const file = await this.filesRepository.findById(id);

    if (!file) throw new NotFoundException('Arquivo não encontrado');
    if (file.uploadedById !== userId) throw new ForbiddenException('Você não tem permissão');

    return {
      url: file.storageUrl ?? file.storagePath,
      expiresIn,
    };
  }

  async delete(id: string, userId: string) {
    return this.deleteFile(id, userId);
  }
}
