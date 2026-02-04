import { Controller, Get, Post, Body, Param, UseGuards, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePreferenceDto } from './dtos/create-preference.dto';
import { PaymentResponseDto } from './dtos/payment-response.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { UserPayload } from '@features/auth/strategies/jwt.strategy';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-preference')
  @UseGuards(JwtAuthGuard)
  async createPreference(
    @CurrentUser() user: UserPayload,
    @Body() createPreferenceDto: CreatePreferenceDto,
  ) {
    return this.paymentsService.createPreference(user.sub, createPreferenceDto);
  }

  @Get('user/history')
  @UseGuards(JwtAuthGuard)
  async getUserHistory(@CurrentUser() user: UserPayload): Promise<PaymentResponseDto[]> {
    return this.paymentsService.getUserHistory(user.sub);
  }

  @Get('success')
  async paymentSuccess(
    @Query('collection_id') collectionId: string,
    @Query('collection_status') collectionStatus: string,
    @Query('payment_id') paymentId: string,
    @Query('status') status: string,
    @Query('external_reference') externalReference: string,
    @Query('payment_type') paymentType: string,
    @Query('merchant_order_id') merchantOrderId: string,
    @Query('preference_id') preferenceId: string,
    @Res() res: Response,
  ) {
    // Página HTML simples de sucesso
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pagamento Aprovado</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
          .success-icon { font-size: 80px; color: #4CAF50; margin-bottom: 20px; }
          h1 { color: #333; margin-bottom: 10px; }
          p { color: #666; line-height: 1.6; }
          .info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px; text-align: left; }
          .info-item { margin: 8px 0; font-size: 14px; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>Pagamento Aprovado!</h1>
          <p>Seu pagamento foi processado com sucesso.</p>
          <div class="info">
            <div class="info-item"><span class="label">ID do Pagamento:</span> <span class="value">${paymentId || 'N/A'}</span></div>
            <div class="info-item"><span class="label">Status:</span> <span class="value">${status || collectionStatus || 'approved'}</span></div>
            <div class="info-item"><span class="label">Tipo:</span> <span class="value">${paymentType || 'N/A'}</span></div>
            <div class="info-item"><span class="label">Referência:</span> <span class="value">${externalReference || 'N/A'}</span></div>
          </div>
          <p style="margin-top: 20px; font-size: 14px; color: #999;">Você pode fechar esta janela.</p>
        </div>
      </body>
      </html>
    `;
    return res.send(html);
  }

  @Get('failure')
  async paymentFailure(
    @Query('collection_id') collectionId: string,
    @Query('collection_status') collectionStatus: string,
    @Query('payment_id') paymentId: string,
    @Query('status') status: string,
    @Query('external_reference') externalReference: string,
    @Res() res: Response,
  ) {
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pagamento Recusado</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
          .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
          .error-icon { font-size: 80px; color: #f44336; margin-bottom: 20px; }
          h1 { color: #333; margin-bottom: 10px; }
          p { color: #666; line-height: 1.6; }
          .info { background: #ffebee; padding: 15px; border-radius: 5px; margin-top: 20px; text-align: left; }
          .info-item { margin: 8px 0; font-size: 14px; }
          .label { font-weight: bold; color: #c62828; }
          .value { color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">❌</div>
          <h1>Pagamento Recusado</h1>
          <p>Infelizmente, não foi possível processar seu pagamento.</p>
          <div class="info">
            <div class="info-item"><span class="label">ID do Pagamento:</span> <span class="value">${paymentId || 'N/A'}</span></div>
            <div class="info-item"><span class="label">Status:</span> <span class="value">${status || collectionStatus || 'rejected'}</span></div>
            <div class="info-item"><span class="label">Referência:</span> <span class="value">${externalReference || 'N/A'}</span></div>
          </div>
          <p style="margin-top: 20px; font-size: 14px;">Por favor, verifique seus dados e tente novamente.</p>
        </div>
      </body>
      </html>
    `;
    return res.send(html);
  }

  @Get('pending')
  async paymentPending(
    @Query('collection_id') collectionId: string,
    @Query('collection_status') collectionStatus: string,
    @Query('payment_id') paymentId: string,
    @Query('status') status: string,
    @Query('external_reference') externalReference: string,
    @Res() res: Response,
  ) {
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pagamento Pendente</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); }
          .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
          .pending-icon { font-size: 80px; color: #ff9800; margin-bottom: 20px; }
          h1 { color: #333; margin-bottom: 10px; }
          p { color: #666; line-height: 1.6; }
          .info { background: #fff3e0; padding: 15px; border-radius: 5px; margin-top: 20px; text-align: left; }
          .info-item { margin: 8px 0; font-size: 14px; }
          .label { font-weight: bold; color: #e65100; }
          .value { color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="pending-icon">⏳</div>
          <h1>Pagamento Pendente</h1>
          <p>Seu pagamento está sendo processado.</p>
          <div class="info">
            <div class="info-item"><span class="label">ID do Pagamento:</span> <span class="value">${paymentId || 'N/A'}</span></div>
            <div class="info-item"><span class="label">Status:</span> <span class="value">${status || collectionStatus || 'pending'}</span></div>
            <div class="info-item"><span class="label">Referência:</span> <span class="value">${externalReference || 'N/A'}</span></div>
          </div>
          <p style="margin-top: 20px; font-size: 14px;">Você receberá uma notificação quando o pagamento for confirmado.</p>
        </div>
      </body>
      </html>
    `;
    return res.send(html);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPaymentById(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.getPaymentById(id, user.sub);
  }
}
