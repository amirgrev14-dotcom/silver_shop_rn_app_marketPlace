import type { FastifyPluginAsync } from "fastify";
import { cartAuthMiddleware } from "../../middleware/auth.middleware.js";
import { createCartModule } from "./index.js";

export const cartRoutes: FastifyPluginAsync = async (fastify) => {
  const { cartController } = createCartModule();

  fastify.addHook("preHandler", cartAuthMiddleware);

  fastify.get("/", cartController.getCart);
  fastify.post("/items", cartController.addItem);
  fastify.patch("/items/:id", cartController.updateQuantity);
  fastify.delete("/items/:id", cartController.removeItem);
  fastify.delete("/", cartController.clearCart);
};
