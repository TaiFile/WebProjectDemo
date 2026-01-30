import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { Payment, Prisma, $Enums } from '@prisma/client';

export interface CreatePaymentData {
  amount: number;
  status: $Enums.PaymentStatus;
  paymentMethodId?: string | null;
  paymentTypeId?: string | null;
  transactionAmount?: number | null;
  externalReference?: string | null;
  preferenceId?: string | null;
  mercadoPagoId?: string | null;
  description?: string | null;
  currency?: string | null;
  userId: string;
}

export interface UpdatePaymentData {
  status?: $Enums.PaymentStatus;
  paymentMethodId?: string | null;
  paymentTypeId?: string | null;
  transactionAmount?: number | null;
  mercadoPagoId?: string | null;
  statusDetail?: string | null;
}

export interface ListPaymentsOptions {
  skip: number;
  take: number;
  userId?: string;
  status?: $Enums.PaymentStatus;
}

export interface ListPaymentsResult {
  items: Payment[];
  total: number;
}

@Injectable()
export class PaymentsRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Buscar pagamento por ID
   */
  async findById(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { id },
    });
  }

  /**
   * Buscar pagamento por ID da transação
   */
  async findByMercadoPagoId(mercadoPagoId: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { mercadoPagoId },
    });
  }

  /**
   * Listar pagamentos do usuário
   */
  async findByUserId(userId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Listar pagamentos com filtros e paginação
   */
  async findWithPagination(options: ListPaymentsOptions): Promise<ListPaymentsResult> {
    const { skip, take, userId, status } = options;

    const where: Prisma.PaymentWhereInput = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Criar novo pagamento
   */
  async create(data: CreatePaymentData): Promise<Payment> {
    return this.prisma.payment.create({ data: data as Prisma.PaymentUncheckedCreateInput });
  }

  /**
   * Atualizar pagamento
   */
  async update(id: string, data: UpdatePaymentData): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id },
      data: data as Prisma.PaymentUncheckedUpdateInput,
    });
  }

  /**
   * Atualizar status do pagamento
   */
  async updateStatus(id: string, status: $Enums.PaymentStatus): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id },
      data: { status } as Prisma.PaymentUncheckedUpdateInput,
    });
  }

  /**
   * Verificar se pagamento existe
   */
  async exists(id: string): Promise<boolean> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });
    return !!payment;
  }

  /**
   * Verificar se pagamento pertence ao usuário
   */
  async belongsToUser(paymentId: string, userId: string): Promise<boolean> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    return payment?.userId === userId;
  }

  /**
   * Contar pagamentos aprovados do usuário
   */
  async countApprovedByUser(userId: string): Promise<number> {
    return this.prisma.payment.count({
      where: {
        userId,
        status: $Enums.PaymentStatus.APPROVED,
      },
    });
  }
}
