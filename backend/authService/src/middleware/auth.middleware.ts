import type { FastifyRequest, FastifyReply } from "fastify"
import { AppError, HttpStatus } from "../common/AppError.js"


export const authMiddleware = async (request: FastifyRequest, _reply: FastifyReply) => {
  try {
    await request.jwtVerify()
  } catch (error) {
    throw new AppError(HttpStatus.UNAUTHORIZED, "Unauthorized")
  }
}