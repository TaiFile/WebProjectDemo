import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const ConfirmEmailSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
});

export type ConfirmEmailDto = z.infer<typeof ConfirmEmailSchema>;
