import { z } from 'zod';

export const CreateAddressSchema = z.object({
  label: z.string().max(100).optional(),
  street: z.string().min(1, 'Rua é obrigatória').max(255),
  number: z.string().min(1, 'Número é obrigatório').max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório').max(100),
  city: z.string().min(1, 'Cidade é obrigatória').max(100),
  state: z.string().min(2, 'Estado é obrigatório').max(2),
  country: z.string().max(100).default('Brasil'),
  zipCode: z
    .string()
    .min(8, 'CEP deve ter 8 dígitos')
    .max(9)
    .transform((val) => val.replace(/\D/g, '')),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isDefault: z.boolean().default(false),
});

export type CreateAddressDto = z.infer<typeof CreateAddressSchema>;

export const UpdateAddressSchema = z.object({
  label: z.string().max(100).optional(),
  street: z.string().min(1).max(255).optional(),
  number: z.string().min(1).max(20).optional(),
  complement: z.string().max(100).optional().nullable(),
  neighborhood: z.string().min(1).max(100).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(2).max(2).optional(),
  country: z.string().max(100).optional(),
  zipCode: z
    .string()
    .min(8)
    .max(9)
    .transform((val) => val.replace(/\D/g, ''))
    .optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateAddressDto = z.infer<typeof UpdateAddressSchema>;
