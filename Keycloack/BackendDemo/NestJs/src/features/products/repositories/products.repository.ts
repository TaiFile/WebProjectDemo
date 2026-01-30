import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { Prisma, Product } from '@prisma/client';

export interface CreateProductData {
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  createdById: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  imageUrl?: string | null;
}

export interface ListProductsOptions {
  skip: number;
  take: number;
  search?: string;
}

export interface ListProductsResult {
  items: Product[];
  total: number;
}

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Buscar produto por ID
   */
  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  /**
   * Listar todos os produtos
   */
  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Listar produtos com paginação e busca
   */
  async findWithPagination(options: ListProductsOptions): Promise<ListProductsResult> {
    const { skip, take, search } = options;

    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Criar novo produto
   */
  async create(data: CreateProductData): Promise<Product> {
    return this.prisma.product.create({ data: data as Prisma.ProductUncheckedCreateInput });
  }

  /**
   * Atualizar produto
   */
  async update(id: string, data: UpdateProductData): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: data as Prisma.ProductUncheckedUpdateInput,
    });
  }

  /**
   * Deletar produto
   */
  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Buscar produtos por categoria
   */
  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { createdById: categoryId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Verificar se produto existe
   */
  async exists(id: string): Promise<boolean> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    return !!product;
  }

  /**
   * Atualizar estoque do produto
   */
  async updateStock(id: string, quantity: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  }
}
