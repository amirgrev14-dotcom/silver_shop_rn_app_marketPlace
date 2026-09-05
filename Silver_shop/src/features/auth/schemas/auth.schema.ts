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

  // Optional in the form (no confirm field in UI yet) — the service
  // defaults it to `password` because the backend requires it.
  confirmPassword: z.string().min(6).optional(),
}).refine(
  (data) => !data.confirmPassword || data.confirmPassword === data.password,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
);

export type RegisterFormData = z.infer<typeof registerSchema>;

export const verifyEmailLinkSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  userId: z.string().min(1).optional(),
});

export type VerifyEmailLinkData = z.infer<typeof verifyEmailLinkSchema>;

