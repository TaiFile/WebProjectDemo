import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './repositories/products.repository';
import { UsersModule } from '@features/users/users.module';
import { KeycloakModule } from '@infrastructure/keycloak';

@Module({
  imports: [UsersModule, KeycloakModule],
  providers: [ProductsService, ProductsRepository],
  controllers: [ProductsController],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
