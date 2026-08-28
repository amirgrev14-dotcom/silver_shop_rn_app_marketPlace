import type { FastifyInstance } from "fastify/types/instance.js";
import { AuthController } from "./controller.js";
import { AuthService } from "./service.js";
import { TokenService } from "./token.js";

export function createAuthModule(fastify: FastifyInstance) {
    const tokenService = new TokenService(fastify);
    const authService = new AuthService(tokenService);
    const authController = new AuthController(authService);

    return {
        authController,
        tokenService,
        authService
    };
}