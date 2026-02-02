import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

import { CommonModule } from '@common/common.module';
import { PrismaModule } from '@infrastructure/database/prisma.module';
import { StorageModule } from '@infrastructure/storage/storage.module';
import { PaymentsModule } from '@infrastructure/payments/payments.module';
import { MailModule } from '@infrastructure/mail/mail.module';
import { GeolocationModule } from '@infrastructure/geolocation/geolocation.module';
import { AuthModule } from '@features/auth/auth.module';
import { UsersModule } from '@features/users/users.module';
import { ProductsModule } from '@features/products/products.module';
import { PaymentsModule as PaymentsFeatureModule } from '@features/payments/payments.module';
import { FilesModule } from '@features/files/files.module';
import { AddressesModule } from '@features/addresses/addresses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TerminusModule,
    CommonModule,
    PrismaModule,
    StorageModule,
    PaymentsModule,
    MailModule,
    GeolocationModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    PaymentsFeatureModule,
    FilesModule,
    AddressesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
