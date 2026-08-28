import zod from "zod";

export const registerSchema = zod.object({
  name: zod.string().min(2, "Name must be at least 2 characters"),
  email: zod.string().email("Invalid email"),
  password: zod.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: zod.string().min(8, "Password must be at least 8 characters"),
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
