import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { MercadoPagoService } from '@infrastructure/payments/mercadopago.service';
import { CreatePreferenceDto } from './dtos/create-preference.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private mercadoPagoService: MercadoPagoService,
  ) {}

  async createPreference(userId: string, createPreferenceDto: CreatePreferenceDto) {
    const externalReference = `user-${userId}-${Date.now()}`;

    const preference = await this.mercadoPagoService.createPreference({
      ...createPreferenceDto,
      externalReference,
    });

    const payment = await this.prisma.payment.create({
      data: {
        preferenceId: preference.id,
        externalReference,
        status: PaymentStatus.PENDING,
        amount: createPreferenceDto.unitPrice * createPreferenceDto.quantity,
        currency: 'BRL',
        description: createPreferenceDto.description,
        userId,
      },
    });

    this.logger.log(`Payment preference created: ${preference.id} for user: ${userId}`);

    return {
      payment,
      preference,
    };
  }

  async processWebhook(webhookData: any) {
    const processedData = await this.mercadoPagoService.processWebhook(webhookData);

    if (!processedData) {
      this.logger.warn('Webhook not processed - unknown type');
      return;
    }

    const payment = await this.prisma.payment.findFirst({
      where: {
        externalReference: processedData.externalReference,
      },
    });

    if (!payment) {
      this.logger.error(`Payment not found for reference: ${processedData.externalReference}`);
      return;
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        mercadoPagoId: processedData.paymentId.toString(),
        status: this.mapPaymentStatus(processedData.status),
        statusDetail: processedData.statusDetail,
        transactionAmount: processedData.transactionAmount,
        paymentMethodId: processedData.paymentMethodId,
        paymentTypeId: processedData.paymentTypeId,
        dateApproved: processedData.dateApproved,
        metadata: processedData.metadata,
      },
    });

    this.logger.log(`Payment updated: ${payment.id} - Status: ${updatedPayment.status}`);

    return updatedPayment;
  }

  async getUserHistory(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((payment) => this.mapPayment(payment));
  }

  async getPaymentById(id: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.mapPayment(payment);
  }

  private mapPaymentStatus(mpStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      approved: PaymentStatus.APPROVED,
      pending: PaymentStatus.PENDING,
      in_process: PaymentStatus.PENDING,
      rejected: PaymentStatus.REJECTED,
      cancelled: PaymentStatus.CANCELLED,
      refunded: PaymentStatus.REFUNDED,
      charged_back: PaymentStatus.REFUNDED,
    };

    return statusMap[mpStatus] || PaymentStatus.PENDING;
  }

  private mapPayment(payment: any) {
    return {
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethodId ?? undefined,
      transactionId: payment.mercadoPagoId ?? undefined,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
