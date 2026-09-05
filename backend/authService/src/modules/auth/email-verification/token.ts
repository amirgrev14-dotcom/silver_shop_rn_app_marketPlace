import type { FastifyInstance } from "fastify";

interface JwtPayload {
  id: string;
  email: string;
}

export class TokenEmailVerifyService {
  constructor(private readonly fastify: FastifyInstance) {}

  signEmailToken(payload: JwtPayload) {
    return this.fastify.jwt.sign(payload, {
      expiresIn: "15m",
    });
  }

  verifyEmailToken(token: string) {
    return this.fastify.jwt.verify<JwtPayload>(token);
  }

}