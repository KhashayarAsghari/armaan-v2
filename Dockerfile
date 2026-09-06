# syntax=docker/dockerfile:1

# ── 1. deps: install dependencies with full devDependencies (needed to build) ──
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# ── 2. builder: compile the Next.js app ────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy build-time-only values (NOT secrets) so `next build` can statically
# analyze/prerender pages that read env vars (e.g. DB helpers) without
# failing. These are build ARGs, not ENV — they don't persist into the final
# runner image or its layer history. Real values are provided at container
# *runtime* via docker-compose's env_file, never baked into the image.
# (`docker build` prints SecretsUsedInArgOrEnv lint warnings below because the
# variable *names* look sensitive — safe to ignore, the values are fake.)
ARG DATABASE_URL="mysql://build:build@127.0.0.1:3306/build"
ARG JWT_SECRET="build-time-placeholder-not-used-at-runtime"
ARG ADMIN_EMAIL="build@example.com"
ARG ADMIN_PASSWORD_HASH="\$2b\$10\$00000000000000000000000000000000000000000000000000"
ARG MINIO_ENDPOINT="minio"
ARG MINIO_ACCESS_KEY="build"
ARG MINIO_SECRET_KEY="build"
ARG MINIO_BUCKET="armaan-uploads"
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── 3. runner: minimal production image ────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Non-root user for defense in depth
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
