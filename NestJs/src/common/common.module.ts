import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
@Global()
@Module({
  providers: [
    JwtAuthGuard,
    RolesGuard,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [JwtAuthGuard, RolesGuard],
})
export class CommonModule {}
