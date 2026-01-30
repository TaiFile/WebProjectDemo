import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

interface ValidationError {
  path: string;
  message: string;
}

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any): any {
    try {
      return this.schema.parse(value);
    } catch (error: any) {
      const formattedErrors: ValidationError[] = error.errors.map((e: any) => ({
        path: e.path.join('.'),
        message: e.message,
      }));

      throw new BadRequestException({
        message: 'Erro de validação',
        errors: formattedErrors,
      });
    }
  }
}
