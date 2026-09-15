import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError, HttpStatus } from "../common/AppError.js";

export interface ProductJwtUser {
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
export const productAuthMiddleware = async (
  request: FastifyRequest,
  _reply: FastifyReply
) => {
  try {
    await request.jwtVerify();
    const user = request.user as ProductJwtUser | undefined;
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

/** SELLER or SUPER_ADMIN only. */
export const sellerMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  await productAuthMiddleware(request, reply);

  const user = request.user as ProductJwtUser;
  if (user.role !== "SELLER" && user.role !== "SUPER_ADMIN") {
    throw new AppError(HttpStatus.FORBIDDEN, "Seller account required");
  }
};

export function tokenUser(request: FastifyRequest): ProductJwtUser {
  return request.user as ProductJwtUser;
}
