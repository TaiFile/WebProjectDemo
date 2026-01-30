import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentsRepository } from './repositories/payments.repository';
import { UsersModule } from '@features/users/users.module';
import { PaymentsModule as PaymentsInfraModule } from '@infrastructure/payments';
import { KeycloakModule } from '@infrastructure/keycloak';

@Module({
  imports: [UsersModule, PaymentsInfraModule, KeycloakModule],
  providers: [PaymentsService, PaymentsRepository],
  controllers: [PaymentsController],
  exports: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
