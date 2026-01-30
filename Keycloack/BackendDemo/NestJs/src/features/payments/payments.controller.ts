import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePreferenceDto, PaymentResponseDto } from './dtos';
import { CurrentUser } from '@common/decorators';
import { JwtAuthGuard } from '@common/guards';
import { KeycloakUser } from '@infrastructure/keycloak';
import { UsersService } from '@features/users/users.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('create-preference')
  async createPreference(
    @CurrentUser() keycloakUser: KeycloakUser,
    @Body() createPreferenceDto: CreatePreferenceDto,
  ) {
    const user = await this.usersService.findOrCreateUser(keycloakUser);
    return this.paymentsService.createPreference(user.id, createPreferenceDto);
  }

  @Get('user/history')
  async getUserHistory(@CurrentUser() keycloakUser: KeycloakUser): Promise<PaymentResponseDto[]> {
    const user = await this.usersService.findOrCreateUser(keycloakUser);
    return this.paymentsService.getUserHistory(user.id);
  }

  @Get(':id')
  async getPaymentById(
    @Param('id') id: string,
    @CurrentUser() keycloakUser: KeycloakUser,
  ): Promise<PaymentResponseDto> {
    const user = await this.usersService.findOrCreateUser(keycloakUser);
    return this.paymentsService.getPaymentById(id, user.id);
  }
}
