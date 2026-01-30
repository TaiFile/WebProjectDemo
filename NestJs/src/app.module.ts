import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

// Common
import { CommonModule } from '@common/common.module';

// Infrastructure
import { PrismaModule } from '@infrastructure/database/prisma.module';
import { StorageModule } from '@infrastructure/storage/storage.module';
import { PaymentsModule } from '@infrastructure/payments/payments.module';
import { MailModule } from '@infrastructure/mail/mail.module';

// Features
import { AuthModule } from '@features/auth/auth.module';
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

    // Common (guards, filters, interceptors)
    CommonModule,

    // Infrastructure
    PrismaModule,
    StorageModule,
    PaymentsModule,
    MailModule,

    // Features
    AuthModule,
    UsersModule,
    ProductsModule,
    PaymentsFeatureModule,
    FilesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
