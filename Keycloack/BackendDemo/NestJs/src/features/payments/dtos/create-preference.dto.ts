import { z } from 'zod';

export const CreatePreferenceSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  description: z.string().optional(),
  unitPrice: z.number().positive('Preço deve ser maior que zero'),
  quantity: z.number().int().positive().default(1),
  productId: z.string().uuid().optional(),
});

export type CreatePreferenceDto = z.infer<typeof CreatePreferenceSchema>;
