import type { FastifyInstance } from "fastify";
import { AppError, HttpStatus } from "../../common/AppError.js";

interface JwtPayload {
  id: string;
  email: string;
}

export type AccessPayload = JwtPayload & { type?: "access" };
export type RefreshPayload = JwtPayload & { type?: "refresh" };

export class TokenService {
  constructor(private readonly fastify: FastifyInstance) {}

  signAccessToken(payload: JwtPayload) {
    return this.fastify.jwt.sign(
      { ...payload, type: "access" },
      {
        expiresIn: "15m",
      }
    );
  }

  signRefreshToken(payload: JwtPayload) {
    return this.fastify.jwt.sign(
      { ...payload, type: "refresh" },
      {
        expiresIn: "7d",
      }
    );
  }

  verifyAccessToken(token: string): AccessPayload {
    try {
      const decoded = this.fastify.jwt.verify<AccessPayload>(token);
      // Accept legacy tokens issued before the `type` claim existed.
      if (decoded.type !== undefined && decoded.type !== "access") {
        throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid access token");
      }
      return decoded;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid or expired access token");
    }
  }

  verifyRefreshToken(token: string): RefreshPayload {
    try {
      const decoded = this.fastify.jwt.verify<RefreshPayload>(token);
      // Legacy refresh tokens have no `type` claim and stay accepted;
      // an explicit access token must never pass as a refresh token.
      if (decoded.type !== undefined && decoded.type !== "refresh") {
        throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
      }
      return decoded;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
    }
  }
}
