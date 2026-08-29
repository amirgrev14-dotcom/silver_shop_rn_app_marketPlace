import fastify from "fastify";
import cors from "@fastify/cors"
import "dotenv/config";
import { errorMiddleware } from "./middleware/error.middleware.js";
// routes
import { authRoutes } from "./modules/auth/routes.js";
// plugins
import jwtPlugin from "./plugins/jwt.js";
import fastifyCookie from "@fastify/cookie";

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
*/

const app = fastify({
  logger: true
})

app.register(cors, {
  // origin: "http://localhost:8081",
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
})

// middleware
app.setErrorHandler(errorMiddleware)

// plugins
await app.register(jwtPlugin)
await app.register(fastifyCookie)

// routes
app.register(authRoutes, {
  prefix: "/api/auth"
})

app.get('/health',  (request, reply) => {
  reply.send({ ok: true })
})

const start = async () => {
  try {
    await app.listen({port: 3002, host: "0.0.0.0"})
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

start()