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

// ------------------------------------------------------------------
// Android App Links — Digital Asset Links statement.
// Must be served EXACTLY at /.well-known/assetlinks.json as
// application/json with no redirects, otherwise Android will not
// verify verify.rayehjay.com and links open in the browser.
// Fingerprint = EAS keystore SHA-256 of the release build.
// ------------------------------------------------------------------
const ASSETLINKS_STATEMENT = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'com.amirgrev.Silver_shop',
      sha256_cert_fingerprints: [
        '76:D4:D0:28:37:B3:38:F2:EE:97:DC:3F:7A:D8:35:50:D6:BF:5F:98:51:CB:0B:43:86:E2:38:F3:77:A6:D1:84',
      ],
    },
  },
];

app.get('/.well-known/assetlinks.json', (_request, reply) => {
  reply.header('Content-Type', 'application/json').send(ASSETLINKS_STATEMENT);
});

// Fallback for browsers: shown only when the app is NOT installed
// (when installed, Android opens the app and never hits this route).
app.get('/verify-email', (_request, reply) => {
  reply.header('Content-Type', 'text/html; charset=utf-8').send(
    '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Silver Shop — verify email</title></head><body style="font-family:sans-serif;max-width:480px;margin:40px auto;padding:0 20px">' +
    '<h1>Silver Shop</h1>' +
    '<p>This confirmation link opens in the Silver Shop app.</p>' +
    '<p>Please install the app on your phone and tap the link from your email again.</p>' +
    '</body></html>',
  );
});

const start = async () => {
  try {
    const port = Number(process.env.PORT ?? 3001)
    // NOTE: DATABASE_URL is the public URL (https://…), not a listen
    // address — app.listen needs a hostname/IP, so always bind 0.0.0.0.
    const host = process.env.HOST ?? "0.0.0.0"

    await app.listen({ port, host })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

start()