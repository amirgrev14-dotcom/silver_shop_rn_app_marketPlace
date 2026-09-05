import type { FastifyInstance } from "fastify";

interface JwtPayload {
  id: string;
  email: string;
}

export class TokenService {
  constructor(private readonly fastify: FastifyInstance) {}

  signAccessToken(payload: JwtPayload) {
    return this.fastify.jwt.sign(payload, {
      expiresIn: "15m",
    });
  }

  signRefreshToken(payload: JwtPayload) {
    return this.fastify.jwt.sign(payload, {
      expiresIn: "7d",
    })
  }

  verifyAccessToken(token: string) {
    return this.fastify.jwt.verify<JwtPayload>(token);
  }

  verifyRefreshToken(token: string) {
    return this.fastify.jwt.verify<JwtPayload>(token);
  }



}