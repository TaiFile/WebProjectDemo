import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ProductsRepository,
  CreateProductData,
  UpdateProductData,
} from './repositories/products.repository';
import { ProductResponseDto } from './dtos/product-response.dto';
// import { CategoriesRepository } from '@features/categories/repositories';

interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  createdById: string;
}

interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
}

interface CreateProductResponse {
  product: ProductResponseDto;
}

interface UpdateProductResponse {
  product: ProductResponseDto;
}

interface ListProductsRequest {
  page: number;
  limit: number;
  search?: string;
}

interface ListProductsResponse {
  products: ProductResponseDto[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ProductsService {
  constructor(
    private productsRepository: ProductsRepository,
    // private categoriesRepository: CategoriesRepository,
  ) {}

  /**
   * Lógica de negócio: Criar produto
   *
   * Validações de negócio:
   * - Preço deve ser positivo
   * - Estoque não pode ser negativo
   * - Categoria deve existir
   */
  async create(createProductRequest: CreateProductRequest): Promise<CreateProductResponse> {
    const { name, description, price, stock, imageUrl, createdById } = createProductRequest;
    if (price <= 0) {
      throw new BadRequestException('Preço deve ser maior que zero');
    }

    if (stock < 0) {
      throw new BadRequestException('Estoque não pode ser negativo');
    }
    const createData: CreateProductData = {
      name,
      description: description || null,
      price,
      stock,
      imageUrl: imageUrl || null,
      createdById,
    };

    const product = await this.productsRepository.create(createData);

    return {
      product: this.mapToProductResponse(product),
    };
  }

  async update(
    productId: string,
    updateProductRequest: UpdateProductRequest,
  ): Promise<UpdateProductResponse> {
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    if (updateProductRequest.price !== undefined && updateProductRequest.price <= 0) {
      throw new BadRequestException('Preço deve ser maior que zero');
    }

    if (updateProductRequest.stock !== undefined && updateProductRequest.stock < 0) {
      throw new BadRequestException('Estoque não pode ser negativo');
    }

    // Validar categoria se for alterada
    // if (updateProductRequest.categoryId) {
    //   const categoryExists = await this.categoriesRepository.exists(
    //     updateProductRequest.categoryId
    //   );
    //   if (!categoryExists) {
    //     throw new NotFoundException('Categoria não encontrada');
    //   }
    // }

    const updateData: UpdateProductData = {
      ...(updateProductRequest.name && { name: updateProductRequest.name }),
      ...(updateProductRequest.description && {
        description: updateProductRequest.description,
      }),
      ...(updateProductRequest.price && { price: updateProductRequest.price }),
      ...(updateProductRequest.stock !== undefined && {
        stock: updateProductRequest.stock,
      }),
      ...(updateProductRequest.imageUrl && {
        imageUrl: updateProductRequest.imageUrl,
      }),
    };

    const updatedProduct = await this.productsRepository.update(productId, updateData);

    return {
      product: this.mapToProductResponse(updatedProduct),
    };
  }

  async list(listProductsRequest: ListProductsRequest): Promise<ListProductsResponse> {
    const { page, limit, search } = listProductsRequest;

    const skip = (page - 1) * limit;

    const { items, total } = await this.productsRepository.findWithPagination({
      skip,
      take: limit,
      search,
    });

    return {
      products: items.map((product) => this.mapToProductResponse(product)),
      total,
      page,
      limit,
    };
  }

  async findById(productId: string): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return this.mapToProductResponse(product);
  }

  async delete(productId: string): Promise<void> {
    const exists = await this.productsRepository.exists(productId);

    if (!exists) {
      throw new NotFoundException('Produto não encontrado');
    }

    await this.productsRepository.delete(productId);
  }

  private mapToProductResponse(product: any): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl ?? null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
