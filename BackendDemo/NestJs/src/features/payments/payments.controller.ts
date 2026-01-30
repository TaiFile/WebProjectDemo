import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePreferenceDto } from './dtos/create-preference.dto';
import { PaymentResponseDto } from './dtos/payment-response.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { UserPayload } from '@features/auth/strategies/jwt.strategy';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-preference')
  async createPreference(
    @CurrentUser() user: UserPayload,
    @Body() createPreferenceDto: CreatePreferenceDto,
  ) {
    return this.paymentsService.createPreference(user.sub, createPreferenceDto);
  }

  @Get('user/history')
  async getUserHistory(@CurrentUser() user: UserPayload): Promise<PaymentResponseDto[]> {
    return this.paymentsService.getUserHistory(user.sub);
  }

  @Get(':id')
  async getPaymentById(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.getPaymentById(id, user.sub);
  }
}
