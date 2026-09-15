import fastify from "fastify";
import cors from "@fastify/cors";
import { fastifyJwt } from "@fastify/jwt";
import "dotenv/config";

import { productRoutes } from "./modules/product/routes.js";

const app = fastify({ logger: true });

app.register(cors, {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Same secret as auth-service: access JWTs are verified locally,
// so this service never calls auth-service at runtime.
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined.");
}

await app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
});

app.register(productRoutes, { prefix: "/api/products" });

app.get("/health", (_request, reply) => {
  reply.send({ ok: true, service: "product-service" });
});

const start = async () => {
  try {
    const port = Number(process.env.PORT ?? 3001);
    const host = process.env.HOST ?? "0.0.0.0";
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
