import { z } from 'zod';

export const GeocodeAddressSchema = z.object({
  address: z.string().min(1, 'Endereço é obrigatório'),
});

export type GeocodeAddressDto = z.infer<typeof GeocodeAddressSchema>;

export const ReverseGeocodeSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type ReverseGeocodeDto = z.infer<typeof ReverseGeocodeSchema>;

export const CalculateDistanceSchema = z
  .object({
    originAddressId: z.string().uuid().optional(),
    originLatitude: z.number().min(-90).max(90).optional(),
    originLongitude: z.number().min(-180).max(180).optional(),
    destinationAddressId: z.string().uuid().optional(),
    destinationLatitude: z.number().min(-90).max(90).optional(),
    destinationLongitude: z.number().min(-180).max(180).optional(),
  })
  .refine(
    (data) => {
      const hasOrigin =
        data.originAddressId ||
        (data.originLatitude !== undefined && data.originLongitude !== undefined);
      const hasDestination =
        data.destinationAddressId ||
        (data.destinationLatitude !== undefined && data.destinationLongitude !== undefined);
      return hasOrigin && hasDestination;
    },
    {
      message: 'Deve fornecer endereço (ID) ou coordenadas para origem e destino',
    },
  );

export type CalculateDistanceDto = z.infer<typeof CalculateDistanceSchema>;

export const AutocompleteSchema = z.object({
  input: z.string().min(3, 'Digite pelo menos 3 caracteres'),
  sessionToken: z.string().optional(),
});

export type AutocompleteDto = z.infer<typeof AutocompleteSchema>;

export const FindNearbySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusInKm: z.number().min(0.1).max(100).default(10),
});

export type FindNearbyDto = z.infer<typeof FindNearbySchema>;
