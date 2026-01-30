import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { File, StorageType, Prisma } from '@prisma/client';

export interface CreateFileData {
  originalName: string;
  mimeType: string;
  size: number;
  storageType: StorageType;
  storagePath: string;
  storageUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  uploadedById: string;
}

export interface ListFilesOptions {
  skip: number;
  take: number;
  userId?: string;
}

export interface ListFilesResult {
  items: File[];
  total: number;
}

@Injectable()
export class FilesRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Buscar arquivo por ID
   */
  async findById(id: string): Promise<File | null> {
    return this.prisma.file.findUnique({
      where: { id },
    });
  }

  /**
   * Listar arquivos do usuário
   */
  async findByUserId(userId: string): Promise<File[]> {
    return this.prisma.file.findMany({
      where: { uploadedById: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Listar arquivos com paginação
   */
  async findWithPagination(options: ListFilesOptions): Promise<ListFilesResult> {
    const { skip, take, userId } = options;

    const where = userId ? { uploadedById: userId } : undefined;

    const [items, total] = await Promise.all([
      this.prisma.file.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.file.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Criar novo arquivo
   */
  async create(data: CreateFileData): Promise<File> {
    return this.prisma.file.create({ data: data as Prisma.FileUncheckedCreateInput });
  }

  /**
   * Deletar arquivo
   */
  async delete(id: string): Promise<void> {
    await this.prisma.file.delete({
      where: { id },
    });
  }

  /**
   * Deletar arquivo e retornar dados para limpeza
   */
  async deleteAndReturn(id: string): Promise<File | null> {
    return this.prisma.file.delete({
      where: { id },
    });
  }

  /**
   * Verificar se arquivo existe
   */
  async exists(id: string): Promise<boolean> {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });
    return !!file;
  }

  /**
   * Verificar se arquivo pertence ao usuário
   */
  async belongsToUser(fileId: string, userId: string): Promise<boolean> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });
    return file?.uploadedById === userId;
  }
}
