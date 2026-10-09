FROM node:24-alpine AS pruner
RUN npm i -g turbo@2.10.12
WORKDIR /app
COPY . .
RUN turbo prune web --docker

FROM node:24-alpine AS installer
RUN npm i -g turbo@2.10.12
RUN corepack enable && corepack prepare pnpm@11.22.0 --activate
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN turbo build

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nextjs \
    && adduser -S nextjs -G nextjs

COPY --from=installer --chown=nextjs:nextjs /app/apps/web/.next/standalone ./

COPY --from=installer --chown=nextjs:nextjs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]