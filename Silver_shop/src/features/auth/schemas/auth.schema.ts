import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),

  password: z.string().min(6, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must contain at least 2 characters'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),

  password: z.string().min(6, 'Password must contain at least 6 characters'),

});

export type RegisterFormData = z.infer<typeof registerSchema>;

