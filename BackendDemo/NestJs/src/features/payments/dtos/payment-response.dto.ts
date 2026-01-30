import { z } from 'zod';

export const PaymentResponseSchema = z.object({
  id: z.string(),
  amount: z.number(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'REFUNDED']),
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PaymentResponseDto = z.infer<typeof PaymentResponseSchema>;
