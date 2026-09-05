import zod from "zod"

export const emailVerificationSchema = zod.object({
  email: zod.string().email("Invalid email"),
})


export type EmailVerification = zod.infer<typeof emailVerificationSchema>
export type EmailVerificationForm = zod.infer<typeof emailVerificationSchema>
