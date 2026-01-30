import { BadRequestException } from '@nestjs/common';

/**
 * Exceção para erros de lógica de negócio
 * Status HTTP: 400 Bad Request
 */
export class BusinessException extends BadRequestException {
  constructor(message: string, code?: string) {
    super({
      statusCode: 400,
      message,
      error: 'Business Error',
      code: code || 'BUSINESS_ERROR',
    });
  }
}
