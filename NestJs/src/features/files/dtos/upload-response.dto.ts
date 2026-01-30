import { z } from 'zod';

export const UploadResponseSchema = z.object({
  id: z.string().uuid(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number().int().positive(),
  storageType: z.enum(['LOCAL', 'S3']),
  url: z.string().url().nullable(),
  uploadedAt: z.date(),
  message: z.string().optional(),
});

export type UploadResponseDto = z.infer<typeof UploadResponseSchema>;
