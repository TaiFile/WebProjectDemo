import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

// Filters
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

// Interceptors
import { LoggingInterceptor } from './interceptors/logging.interceptor';

/**
 * CommonModule
 *
 * Módulo global que fornece guards, filters e interceptors
 * para toda a aplicação.
 *
 * Os providers são registrados globalmente via APP_* tokens,
 * então não precisam ser aplicados manualmente em cada controller.
 *
 * Para usar JwtAuthGuard em uma rota específica:
 * @UseGuards(JwtAuthGuard)
 *
 * Para usar RolesGuard (requer JwtAuthGuard antes):
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin')
 */
@Global()
@Module({
  providers: [
    // Guards disponíveis para injeção
    JwtAuthGuard,
    RolesGuard,

    // Filter global - captura todas as exceções
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },

    // Interceptor global - loga todas as requisições
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [
    // Exporta guards para uso com @UseGuards()
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class CommonModule {}
