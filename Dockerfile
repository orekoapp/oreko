# ============================================
# Oreko Production Dockerfile
# Multi-stage build for optimal image size
# ============================================

# Base image with pnpm
FROM node:20.18-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# ============================================
# Dependencies stage
# ============================================
FROM base AS deps
WORKDIR /app

# Use hoisted node-linker so binaries like prisma are accessible at node_modules/.bin
RUN echo "node-linker=hoisted" > .npmrc

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/ui/package.json ./packages/ui/
COPY packages/utils/package.json ./packages/utils/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ============================================
# Builder stage
# ============================================
FROM base AS builder
WORKDIR /app

# Copy everything from deps stage (preserves workspace structure + hoisted node_modules)
COPY --from=deps /app ./

# Copy source code on top
COPY . .

# Re-link workspace packages (symlinks don't survive Docker COPY between stages)
RUN mkdir -p node_modules/@oreko && \
    ln -sf ../../../packages/database node_modules/@oreko/database && \
    ln -sf ../../../packages/ui node_modules/@oreko/ui && \
    ln -sf ../../../packages/utils node_modules/@oreko/utils && \
    ln -sf ../../../packages/types node_modules/@oreko/types

# Generate Prisma client
RUN ./node_modules/.bin/prisma generate --schema=packages/database/prisma/schema.prisma

# Build the application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=1
RUN cd apps/web && ../../node_modules/.bin/next build

# ============================================
# Runner stage
# ============================================
FROM base AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Copy Prisma schema and generated client
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
