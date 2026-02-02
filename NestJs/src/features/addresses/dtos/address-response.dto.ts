import { z } from 'zod';

export const AddressResponseSchema = z.object({
  id: z.string().uuid(),
  label: z.string().nullable(),
  street: z.string(),
  number: z.string(),
  complement: z.string().nullable(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  zipCode: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  formattedAddress: z.string().nullable(),
  placeId: z.string().nullable(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AddressResponseDto = z.infer<typeof AddressResponseSchema>;
