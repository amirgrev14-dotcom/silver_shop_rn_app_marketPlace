import "./config/env.js";
import fastify from "fastify";
import cors from "@fastify/cors";
import { fastifyJwt } from "@fastify/jwt";

import { cartRoutes } from "./modules/cart/routes.js";
import { orderRoutes } from "./modules/order/routes.js";

const app = fastify({ logger: true });

app.register(cors, {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined.");
}

await app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
});

app.register(cartRoutes, { prefix: "/api/cart" });
app.register(orderRoutes, { prefix: "/api/orders" });

app.get("/health", (_request, reply) => {
  reply.send({ ok: true, service: "cart-service" });
});

const start = async () => {
  try {
    const port = Number(process.env.PORT ?? 3002);
    const host = process.env.HOST ?? "0.0.0.0";
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
