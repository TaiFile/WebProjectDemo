import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentsRepository } from './repositories/payments.repository';
import { PaymentsModule as PaymentsInfraModule } from '@infrastructure/payments/payments.module';

@Module({
  imports: [PaymentsInfraModule],
  providers: [PaymentsService, PaymentsRepository],
  controllers: [PaymentsController],
  exports: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
