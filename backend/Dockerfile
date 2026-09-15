# Single image for BOTH backend services.
# SERVICE env selects the process: auth-service (:3000) or product-service (:3001).
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
RUN npm ci --prefix authService --no-audit --no-fund \
 && npm ci --prefix productService --no-audit --no-fund

FROM install AS build
COPY authService ./authService
COPY productService ./productService
RUN sh -c "cd authService && npx prisma generate && npx tsc" \
 && sh -c "cd productService && npx prisma generate && npx tsc"

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /srv/authService ./authService
COPY --from=build /srv/productService ./productService
CMD ["sh", "-c", "if [ \"$SERVICE\" = \"product-service\" ]; then cd productService && npx prisma migrate deploy && node dist/server.js; else cd authService && npx prisma migrate deploy && node dist/server.js; fi"]
