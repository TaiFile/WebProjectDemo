import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  description: z.string().max(1000).optional(),
  price: z.number().positive('Preço deve ser maior que zero'),
  stock: z.number().int().nonnegative('Estoque não pode ser negativo'),
  imageUrl: z.string().url().optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
