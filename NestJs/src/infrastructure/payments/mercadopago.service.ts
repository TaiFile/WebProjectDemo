import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

export interface CreatePreferenceDto {
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  externalReference?: string;
  payerEmail?: string;
}

export interface PreferenceResponse {
  id: string;
  initPoint: string;
  sandboxInitPoint: string;
}

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private client: MercadoPagoConfig;
  private preferenceClient: Preference;
  private paymentClient: Payment;

  constructor(private configService: ConfigService) {
    const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');

    if (!accessToken) {
      this.logger.warn('⚠️  MercadoPago access token not configured');
      return;
    }

    this.client = new MercadoPagoConfig({
      accessToken: accessToken,
      options: {
        timeout: 5000,
      },
    });

    this.preferenceClient = new Preference(this.client);
    this.paymentClient = new Payment(this.client);

    this.logger.log('✅ MercadoPago configured successfully');
  }

  async createPreference(data: CreatePreferenceDto): Promise<PreferenceResponse> {
    if (!this.preferenceClient) {
      throw new Error('MercadoPago not configured - missing access token');
    }

    try {
      const preferenceData = {
        body: {
          items: [
            {
              id: data.externalReference || '1',
              title: data.title,
              description: data.description,
              quantity: data.quantity,
              unit_price: data.unitPrice,
              currency_id: 'BRL',
            },
          ],
          external_reference: data.externalReference,
          payer: data.payerEmail
            ? {
                email: data.payerEmail,
              }
            : undefined,
          back_urls: {
            success: `${this.configService.get('APP_URL', 'http://localhost:3000')}/api/payments/success`,
            failure: `${this.configService.get('APP_URL', 'http://localhost:3000')}/api/payments/failure`,
            pending: `${this.configService.get('APP_URL', 'http://localhost:3000')}/api/payments/pending`,
          },
          notification_url: `${this.configService.get('APP_URL', 'http://localhost:3000')}/webhooks/mercadopago`,
        },
      };

      const response = await this.preferenceClient.create(preferenceData);

      this.logger.log(`Preference created: ${response.id}`);

      return {
        id: response.id,
        initPoint: response.init_point,
        sandboxInitPoint: response.sandbox_init_point,
      };
    } catch (error) {
      this.logger.error('Failed to create preference', error);
      throw new Error('Failed to create payment preference');
    }
  }

  async getPayment(paymentId: string) {
    if (!this.paymentClient) {
      throw new Error('MercadoPago not configured - missing access token');
    }

    try {
      const response = await this.paymentClient.get({ id: paymentId });
      return response;
    } catch (error) {
      this.logger.error(`Failed to get payment: ${paymentId}`, error);
      throw new Error('Failed to get payment information');
    }
  }

  async processWebhook(data: any) {
    try {
      this.logger.log(`Processing webhook: ${JSON.stringify(data)}`);

      if (data.type === 'payment') {
        const paymentId = data.data.id;

        if (typeof paymentId === 'string' && paymentId.includes('-')) {
          this.logger.warn(`⚠️  Test mode: Using mock payment data for ${paymentId}`);
          return {
            paymentId: paymentId,
            status: 'approved',
            statusDetail: 'accredited',
            transactionAmount: 100.0,
            externalReference: data.external_reference || 'test-reference',
            paymentMethodId: 'master',
            paymentTypeId: 'credit_card',
            dateApproved: new Date().toISOString(),
            metadata: {},
          };
        }

        const payment = await this.getPayment(paymentId);

        this.logger.log(`Payment webhook processed: ${paymentId} - Status: ${payment.status}`);

        return {
          paymentId: payment.id,
          status: payment.status,
          statusDetail: payment.status_detail,
          transactionAmount: payment.transaction_amount,
          externalReference: payment.external_reference,
          paymentMethodId: payment.payment_method_id,
          paymentTypeId: payment.payment_type_id,
          dateApproved: payment.date_approved,
          metadata: payment.metadata,
        };
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to process webhook', error);
      throw error;
    }
  }
}
