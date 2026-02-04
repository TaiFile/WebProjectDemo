import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

/**
 * Módulo global de email
 * Pode ser injetado em qualquer módulo sem precisar importar
 */
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
