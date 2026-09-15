import type { FastifyPluginAsync } from "fastify";
import {
  productAuthMiddleware,
  sellerMiddleware,
} from "../../middleware/auth.middleware.js";
import { createProductModule } from "./index.js";

export const productRoutes: FastifyPluginAsync = async (fastify) => {
  const { productController } = createProductModule();

  // Public feed + details (only ACTIVE/SOLD are listed).
  fastify.get("/", productController.feed);
  fastify.get("/:id", productController.getById);

  // Sellers only. sellerId comes from the verified JWT, never the body.
  fastify.post("/", { preHandler: sellerMiddleware }, productController.create);
  fastify.patch(
    "/:id",
    { preHandler: productAuthMiddleware },
    productController.update
  );
  fastify.delete(
    "/:id",
    { preHandler: productAuthMiddleware },
    productController.remove
  );
};
