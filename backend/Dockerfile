# Single image for ALL backend services.
# SERVICE env selects the process: auth-service (:3000) | product-service (:3001) | cart-service (:3002).
# Build context: ./backend
#   docker build -f backend/Dockerfile -t silver-shop ./backend
# NOTE: `npm run build` of each service runs migrate deploy, which needs a
# live DB — so the image builds code only (generate + tsc); migrations run
# at container start (see CMD).

FROM node:24-alpine AS base
WORKDIR /srv
RUN apk add --no-cache openssl libc6-compat

FROM base AS install
COPY authService/package.json authService/package-lock.json ./authService/
COPY productService/package.json productService/package-lock.json ./productService/
COPY cartService/package.json cartService/package-lock.json ./cartService/
RUN npm ci --prefix authService --no-audit --no-fund \
 && npm ci --prefix productService --no-audit --no-fund \
 && npm ci --prefix cartService --no-audit --no-fund

FROM install AS build
COPY authService ./authService
COPY productService ./productService
COPY cartService ./cartService
# prisma generate only loads the config (never connects), but the config
# throws without *some* DATABASE_URL — a dummy is enough at build time.
# Real URL comes from env_file / environment at container start.
ARG DATABASE_URL="postgresql://build@localhost:5432/build"
RUN sh -c "cd authService && npx prisma generate && npx tsc" \
 && sh -c "cd productService && npx prisma generate && npx tsc" \
 && sh -c "cd cartService && npx prisma generate && npx tsc"

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /srv/authService ./authService
COPY --from=build /srv/productService ./productService
COPY --from=build /srv/cartService ./cartService
CMD ["sh", "-c", "if [ \"$SERVICE\" = \"product-service\" ]; then cd productService && npx prisma migrate deploy && node dist/server.js; elif [ \"$SERVICE\" = \"cart-service\" ]; then cd cartService && npx prisma migrate deploy && node dist/server.js; else cd authService && npx prisma migrate deploy && node dist/server.js; fi"]
