import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError, HttpStatus } from "../common/AppError.js";

export const errorMiddleware = async (
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  
  console.error("Error:", error);
  if (error instanceof AppError) {
    return reply.status(error.status).send({
      success: false,
      message: error.message,
    });
  }

  // Fastify schema-validation failures (e.g. bad params/body shape)
  // must not surface as 500s.
  if (error.validation) {
    return reply.status(HttpStatus.BAD_REQUEST).send({
      success: false,
      message: error.message,
    });
  }

  const status =
    typeof error.statusCode === "number"
      ? error.statusCode
      : HttpStatus.INTERNAL_SERVER_ERROR;
  return reply.status(status).send({
    success: false,
    message: status === HttpStatus.INTERNAL_SERVER_ERROR ? "Internal Server Error" : error.message,
  });
}