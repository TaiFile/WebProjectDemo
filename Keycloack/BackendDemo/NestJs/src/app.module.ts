import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

// Infrastructure
import { PrismaModule } from '@infrastructure/database';
import { KeycloakModule } from '@infrastructure/keycloak';
import { StorageModule } from '@infrastructure/storage';
import { PaymentsModule } from '@infrastructure/payments';

// Features
import { UsersModule } from '@features/users/users.module';
import { ProductsModule } from '@features/products/products.module';
import { PaymentsModule as PaymentsFeatureModule } from '@features/payments/payments.module';
import { FilesModule } from '@features/files/files.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Health checks
    TerminusModule,

    // Infrastructure
    PrismaModule,
    KeycloakModule,
    StorageModule,
    PaymentsModule,

    // Features
    UsersModule,
    ProductsModule,
    PaymentsFeatureModule,
    FilesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
