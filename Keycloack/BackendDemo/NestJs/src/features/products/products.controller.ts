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
import { CreateProductSchema, UpdateProductSchema, PaginationSchema } from './dtos';
import { JwtAuthGuard } from '@common/guards';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import { CurrentUser } from '@common/decorators';
import { KeycloakUser } from '@infrastructure/keycloak';
import { UsersService } from '@features/users/users.service';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

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
    @CurrentUser() keycloakUser: KeycloakUser,
    @Body(new ZodValidationPipe(CreateProductSchema))
    createProductDto: any,
  ) {
    const user = await this.usersService.findOrCreateUser(keycloakUser);
    const { product } = await this.productsService.create({
      ...createProductDto,
      createdById: user.id,
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
