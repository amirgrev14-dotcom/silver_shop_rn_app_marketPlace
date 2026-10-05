import zod from "zod";
import { Role } from "@prisma/client";

export const registerSchema = zod.object({
  name: zod.string().min(2, "Name must be at least 2 characters"),
  email: zod.string().email("Invalid email"),
  password: zod.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: zod.string().min(8, "Password must be at least 8 characters"),
  role: zod.enum([Role.BUYER, Role.SELLER]).default(Role.BUYER),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});


export const loginSchema = zod.object({
  email: zod.string().email("Invalid email"),
  password: zod.string().min(8, "Password must be at least 8 characters"),
})


export type LoginDto = zod.infer<typeof loginSchema>
export type RegisterDto = zod.infer<typeof registerSchema>

// Native clients (React Native) have no cookie jar, so they send the
// stored refresh token explicitly. Web keeps using the httpOnly cookie.
// All three sources are optional here — the controller rejects the request
// when none of them carries a token.
export const refreshSchema = zod.object({
  refreshToken: zod.string().min(1).optional(),
})

export type RefreshDto = zod.infer<typeof refreshSchema>
