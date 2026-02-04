import { z } from 'zod';

export const FileResponseSchema = z.object({
  id: z.string().uuid(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number().int(),
  storageType: z.enum(['LOCAL', 'S3']),
  storagePath: z.string(),
  storageUrl: z.string().url().nullable(),
  uploadedById: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type FileResponseDto = z.infer<typeof FileResponseSchema>;
