import type { FastifyPluginAsync } from "fastify";
import { cartAuthMiddleware } from "../../middleware/auth.middleware.js";
import { createOrdersModule } from "./index.js";

export const orderRoutes: FastifyPluginAsync = async (fastify) => {
  const { ordersController } = createOrdersModule();

  fastify.addHook("preHandler", cartAuthMiddleware);

  fastify.post("/", ordersController.createOrder);
};
