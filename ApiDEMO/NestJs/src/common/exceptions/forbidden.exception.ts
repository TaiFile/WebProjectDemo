import { ForbiddenException } from '@nestjs/common';

/**
 * Exceção para quando o usuário não tem permissão para acessar o recurso
 * Status HTTP: 403 Forbidden
 */
export class ForbiddenAccessException extends ForbiddenException {
  constructor(message: string = 'Access denied', code?: string) {
    super({
      statusCode: 403,
      message,
      error: 'Forbidden',
      code: code || 'FORBIDDEN_ACCESS',
    });
  }
}
