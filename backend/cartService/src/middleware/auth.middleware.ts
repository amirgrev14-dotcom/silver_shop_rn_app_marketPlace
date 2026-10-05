import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError, HttpStatus } from "../common/AppError.js";

export interface CartJwtUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  type?: "access" | "refresh";
}

/**
 * Verifies the access JWT locally using the shared JWT_SECRET.
 * No call to auth-service — this service stays up even if auth is down.
 * A token without a role claim (issued before role claims) is rejected:
 * the client just needs a fresh login (access tokens live 15 minutes).
 */
export const cartAuthMiddleware = async (
  request: FastifyRequest,
  _reply: FastifyReply
) => {
  try {
    await request.jwtVerify();
    const user = request.user as CartJwtUser | undefined;
    if (!user?.id || (user.type !== undefined && user.type !== "access")) {
      throw new AppError(HttpStatus.UNAUTHORIZED, "Unauthorized");
    }
    if (!user.role) {
      throw new AppError(HttpStatus.UNAUTHORIZED, "Token role missing, please log in again");
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(HttpStatus.UNAUTHORIZED, "Unauthorized");
  }
};

export function tokenUser(request: FastifyRequest): CartJwtUser {
  return request.user as CartJwtUser;
}
