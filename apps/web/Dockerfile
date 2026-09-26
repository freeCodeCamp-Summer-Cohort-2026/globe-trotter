FROM node:24-alpine AS pruner
RUN npm i -g turbo@2.10.12
WORKDIR /app
COPY . .
RUN turbo prune web --docker

FROM node:24-alpine AS installer
RUN npm i -g turbo@2.10.12
RUN corepack enable pnpm
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN turbo build

FROM node:24-alpine AS runner
WORKDIR /app
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/web/.next/standalone ./
COPY --from=installer /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer /app/apps/web/public ./apps/web/public
CMD ["node", "apps/web/server.js"]