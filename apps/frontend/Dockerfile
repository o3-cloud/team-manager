# syntax=docker/dockerfile:1.10

FROM node:26.1.0-alpine3.23 AS base
RUN npm install -g pnpm@11.0.8
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/frontend/package.json apps/frontend/
COPY packages/ui/package.json packages/ui/
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter @team-manager/frontend

# development target for docker compose watch
FROM deps AS dev
COPY tsconfig.base.json ./
COPY apps/frontend ./apps/frontend
COPY packages/ui ./packages/ui
EXPOSE 5173
CMD ["pnpm", "--filter", "@team-manager/frontend", "dev", "--host"]

# build stage
FROM deps AS builder
COPY tsconfig.base.json ./
COPY apps/frontend ./apps/frontend
COPY packages/ui ./packages/ui
RUN pnpm --filter @team-manager/frontend build

# nginx runtime — runs on port 8080 as the pre-existing nginx user (UID 101)
FROM nginx:1.30.0-alpine3.23 AS runner
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
USER nginx
EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]
