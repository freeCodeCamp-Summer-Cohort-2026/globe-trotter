# ==========================================
# Base Stage: Setup pnpm
# ==========================================
FROM node:24-alpine AS base
RUN corepack enable pnpm

# ==========================================
# Pruner Stage: Extract only the needed packages
# ==========================================
FROM base AS pruner
WORKDIR /app

RUN npm install -g turbo@2.10.12

# Copy the entire monorepo and prune it down to just the 'api' app and its dependencies
COPY . .
RUN turbo prune api --docker

# ==========================================
# Builder Stage: Install dependencies and build
# ==========================================
FROM base AS builder
WORKDIR /app

# 1. Install dependencies (Layer caching optimization)
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# 2. Copy source code
COPY --from=pruner /app/out/full/ .

# 3. Build the API and its local package dependencies
RUN pnpm turbo run build --filter=api

# 4. Extract only the production files into /prod/api
RUN pnpm deploy --legacy --filter=api --prod /prod/api

# ==========================================
# Runner Stage: Lightweight production image
# ==========================================
FROM node:24-alpine AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 api
USER api

# Copy the deployed dependencies and the built dist folder
COPY --from=builder --chown=api:nodejs /prod/api .
COPY --from=builder --chown=api:nodejs /app/apps/api/dist ./dist

EXPOSE 4000
CMD ["node", "dist/main"]


# ---------------------------------------------------------
# Legacy / Reference Configurations 
# ---------------------------------------------------------

# docker without prune (Monolithic build)
# FROM node:24-alpine AS prod
# WORKDIR /app
# RUN npm i -g pnpm
# # Copy package.json files before source code - Docker caches each layer.
# # If only source changes, pnpm install layer is reused and build is faster
# COPY package*.json ./
# COPY pnpm-lock.yaml ./
# COPY pnpm-workspace.yaml ./
# COPY ./packages/config/eslint/package.json ./packages/config/eslint/
# COPY ./packages/config/tailwind/package.json ./packages/config/tailwind/
# COPY ./packages/config/jest/package.json ./packages/config/jest/
# COPY ./packages/config/typescript/package.json ./packages/config/typescript/
# COPY ./packages/database/package.json ./packages/database/
# COPY ./packages/ui/package.json ./packages/ui/
# COPY apps/api/package.json ./apps/api/package.json
# RUN pnpm i --frozen-lockfile
# # Copy source code in a seperate layer after dependencies are installed
# COPY . .
# WORKDIR /app/apps/api
# RUN pnpm run build
# EXPOSE 4000
# CMD ["node", "dist/main"]

# Hot reloading (Development)
# FROM node:24-alpine AS dev
# WORKDIR /app
# RUN npm i -g pnpm
# COPY package*.json ./
# COPY pnpm-lock.yaml ./
# COPY pnpm-workspace.yaml ./
# COPY ./packages/config/eslint/package.json ./packages/config/eslint/
# COPY ./packages/config/tailwind/package.json ./packages/config/tailwind/
# COPY ./packages/config/jest/package.json ./packages/config/jest/
# COPY ./packages/config/typescript/package.json ./packages/config/typescript/
# COPY ./packages/database/package.json ./packages/database/
# COPY ./packages/ui/package.json ./packages/ui/
# COPY apps/api/package.json ./apps/api/package.json
# RUN pnpm i
# COPY . .
# CMD ["pnpm", "run", "dev"]
