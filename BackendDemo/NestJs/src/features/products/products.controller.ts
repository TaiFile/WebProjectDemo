import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductSchema } from './dtos/create-product.dto';
import { UpdateProductSchema } from './dtos/update-product.dto';
import { PaginationSchema } from './dtos/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserPayload } from '@features/auth/strategies/jwt.strategy';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Controller: Apenas recebe, valida e delega
   *
   * - Validação de entrada via Zod Pipe
   * - Delega para service
   * - Retorna resposta HTTP
   */
  @Post()
  @HttpCode(201)
  async create(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(CreateProductSchema))
    createProductDto: any,
  ) {
    const { product } = await this.productsService.create({
      ...createProductDto,
      createdById: user.sub,
    });
    return product;
  }

  /**
   * Controller: Apenas recebe, valida e delega
   */
  @Get()
  @HttpCode(200)
  async list(
    @Query(new ZodValidationPipe(PaginationSchema))
    paginationDto: any,
  ): Promise<{ products: any; total: number; page: number; limit: number }> {
    return this.productsService.list(paginationDto);
  }

  /**
   * Controller: Apenas recebe e delega
   */
  @Get(':id')
  @HttpCode(200)
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  /**
   * Controller: Apenas recebe, valida e delega
   */
  @Put(':id')
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProductSchema))
    updateProductDto: any,
  ) {
    const { product } = await this.productsService.update(id, updateProductDto);
    return product;
  }

  /**
   * Controller: Apenas recebe e delega
   */
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    await this.productsService.delete(id);
  }
}
