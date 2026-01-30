import { z } from 'zod';

export const PreferenceResponseSchema = z.object({
  id: z.string(),
  initPoint: z.string().url(),
  sandboxInitPoint: z.string().url().optional(),
  status: z.enum(['pending', 'approved', 'rejected']),
  createdAt: z.date(),
});

export type PreferenceResponseDto = z.infer<typeof PreferenceResponseSchema>;
