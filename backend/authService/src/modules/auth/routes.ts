import type { FastifyPluginAsync } from "fastify";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createAuthModule } from "./index.js";


export const authRoutes: FastifyPluginAsync = async (fastify) => {
  const { authController } = createAuthModule(fastify);

  
  fastify.post("/register", authController.register);
  fastify.post("/login", authController.login);
  fastify.post("/refresh", authController.refresh);
  fastify.post("/logout", authController.logout);
  fastify.get("/me", {preHandler: authMiddleware} , authController.me);
  
};