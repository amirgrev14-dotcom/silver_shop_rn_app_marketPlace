import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError, HttpStatus } from "../common/AppError.js";

export const errorMiddleware = async (
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  
  if (error instanceof AppError) {
    return reply.status(error.status).send({
      success: false,
      message: error.message,
    });
  }
  
  return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
    success: false,
    message: "Internal Server Error",
  });
}