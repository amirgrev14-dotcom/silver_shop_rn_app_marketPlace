import fastify from "fastify";
import cors from "@fastify/cors"
import "dotenv/config";
import { errorMiddleware } from "./middleware/error.middleware.js";
// routes
import { authRoutes } from "./modules/auth/routes.js";
import { emailVerificationRoutes } from "./modules/auth/email-verification/routes.js";

// plugins
import jwtPlugin from "./plugins/jwt.js";
import fastifyCookie from "@fastify/cookie";


// cron
import job from "./lib/cron.js";

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
*/

const app = fastify({
  logger: true
})


job.start()
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

app.register(emailVerificationRoutes, {
  prefix: "api/auth/email-verification"
})

app.get('/health',  (request, reply) => {
  reply.send({ ok: true })
})

const start = async () => {
  try {
    const port = Number(process.env.PORT ?? 3000)
    const host = process.env.URL_API_RENDER ?? "0.0.0.0"

    await app.listen({ port, host })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

start()