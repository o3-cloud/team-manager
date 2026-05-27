# syntax=docker/dockerfile:1.10

FROM node:26.1.0-alpine3.23 AS base
RUN npm install -g pnpm@11.0.8
WORKDIR /app

# dependency install stage
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/backend/package.json apps/backend/
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter @team-manager/backend

# build stage
FROM deps AS builder
COPY tsconfig.base.json ./
COPY apps/backend ./apps/backend
RUN pnpm --filter @team-manager/backend build

# production runtime (distroless-style)
FROM node:26.1.0-alpine3.23 AS runner
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY apps/backend/package.json ./apps/backend/package.json

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

ENTRYPOINT ["node", "apps/backend/dist/main"]
