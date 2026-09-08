# syntax=docker/dockerfile:1

# ---- Build stage: install all deps, generate Prisma client, compile Nest ----
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Prisma needs openssl to build/run its query engine.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Precompile the seed script to JS so the runtime can run it with plain `node`
# (ts-node can't load .ts under Node 20's ESM resolver).
RUN npx tsc prisma/seed.ts --outDir prisma --module commonjs --target ES2021 \
    --esModuleInterop --skipLibCheck --resolveJsonModule

# ---- Runtime stage ----
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Bring over installed deps (incl. Prisma CLI for migrate deploy), build output,
# schema/migrations, and the entrypoint.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Data (SQLite db + uploaded evidence) lives on a volume so it survives restarts.
ENV DATABASE_URL="file:/data/dev.db"
ENV UPLOADS_DIR="/data/uploads"
ENV PORT=4000
RUN mkdir -p /data/uploads
VOLUME ["/data"]

EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
