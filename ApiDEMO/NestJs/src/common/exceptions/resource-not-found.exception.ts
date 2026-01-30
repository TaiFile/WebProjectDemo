import { NotFoundException } from '@nestjs/common';

/**
 * Exceção para quando um recurso não é encontrado
 * Status HTTP: 404 Not Found
 */
export class ResourceNotFoundException extends NotFoundException {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with id ${identifier} not found`
      : `${resource} not found`;

    super({
      statusCode: 404,
      message,
      error: 'Not Found',
      code: 'RESOURCE_NOT_FOUND',
    });
  }
}
