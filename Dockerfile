# Geoteknia — Dockerfile multi-stage
# Base: node:22-bookworm-slim (glibc para argon2, sharp, Prisma engines)

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.0.8 --activate

# Dependencias nativas para argon2/sharp
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm exec prisma generate

FROM deps AS dev
COPY . .
USER node
EXPOSE 3000
CMD ["pnpm", "run", "dev", "--hostname", "0.0.0.0"]

FROM deps AS builder
COPY . .
ARG DATABASE_URL=postgresql://geoteknia:geoteknia_dev_only@host.docker.internal:5433/geoteknia_dev?sslmode=disable
ARG DIRECT_URL=postgresql://geoteknia:geoteknia_dev_only@host.docker.internal:5433/geoteknia_dev?sslmode=disable
ARG NEXTAUTH_SECRET=build-placeholder-nextauth-secret-min-32
ARG NEXTAUTH_URL=http://localhost:3000
ARG ANTHROPIC_API_KEY=sk-ant-build-placeholder
ARG RESEND_API_KEY=re_build_placeholder
ARG EMAIL_FROM=Geoteknia <build@example.com>
ARG EMAIL_REPLY_TO=build@example.com
ARG TURNSTILE_SECRET_KEY=0x4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NODE_ENV=production
ARG SESSION_TTL_MINUTES=480
ARG TWOFA_ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000
ARG MEDIA_STORAGE_BASE_URL=http://localhost:3000
ENV DATABASE_URL=$DATABASE_URL \
    DIRECT_URL=$DIRECT_URL \
    NEXTAUTH_SECRET=$NEXTAUTH_SECRET \
    NEXTAUTH_URL=$NEXTAUTH_URL \
    ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
    RESEND_API_KEY=$RESEND_API_KEY \
    EMAIL_FROM=$EMAIL_FROM \
    EMAIL_REPLY_TO=$EMAIL_REPLY_TO \
    TURNSTILE_SECRET_KEY=$TURNSTILE_SECRET_KEY \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NODE_ENV=$NODE_ENV \
    SESSION_TTL_MINUTES=$SESSION_TTL_MINUTES \
    TWOFA_ENCRYPTION_KEY=$TWOFA_ENCRYPTION_KEY \
    MEDIA_STORAGE_BASE_URL=$MEDIA_STORAGE_BASE_URL
RUN pnpm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs --home /home/nodejs nodejs
ENV HOME=/home/nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/prisma ./prisma

USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=60s \
  CMD node -e "fetch('http://127.0.0.1:3000').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0"]
