import type { FastifyRequest, FastifyReply } from "fastify"
import { AppError, HttpStatus } from "../common/AppError.js"


export const authMiddleware = async (request: FastifyRequest, _reply: FastifyReply) => {
  try {
    await request.jwtVerify()
    // A refresh token must never grant API access (legacy tokens
    // issued before the `type` claim have it undefined and stay valid).
    const user = request.user as { type?: string } | undefined;
    if (user?.type !== undefined && user.type !== "access") {
      throw new AppError(HttpStatus.UNAUTHORIZED, "Unauthorized")
    }
  } catch (error) {
    throw new AppError(HttpStatus.UNAUTHORIZED, "Unauthorized")
  }
}