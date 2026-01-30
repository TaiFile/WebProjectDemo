import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('mercadopago')
  @HttpCode(200)
  async handleMercadoPagoWebhook(@Body() webhookData: any) {
    await this.paymentsService.processWebhook(webhookData);
    return { success: true };
  }
}
