FROM node:20-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm i -g pnpm
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/web/package.json ./
COPY ./packages/config/eslint/package.json ./packages/config/eslint/
COPY ./packages/config/tailwind/package.json ./packages/config/tailwind/
COPY ./packages/config/jest/package.json ./packages/config/jest/
COPY ./packages/config/typescript/package.json ./packages/config/typescript/
COPY ./packages/database/package.json ./packages/database/
COPY ./packages/ui/package.json ./packages/ui/
COPY package*.json ./
RUN pnpm i
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build
# Next's output tracing can drop the esm/ subfolder of @swc/helpers under pnpm's
# symlinked store when the app uses "type": "module" — copy it in explicitly
# so the standalone server can resolve it at runtime.
RUN for d in node_modules/.pnpm/@swc+helpers@*/node_modules/@swc/helpers; do \
      v=$(basename $(dirname $(dirname "$d"))); \
      dest="apps/web/.next/standalone/node_modules/.pnpm/$v/node_modules/@swc/helpers"; \
      mkdir -p "$dest" && cp -r "$d"/. "$dest"/; \
    done

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
EXPOSE 3001
CMD ["node", "apps/web/server.js"]

#dev mode for hot reload
FROM node:20-alpine AS dev
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm i -g pnpm
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/web/package.json ./
COPY ./packages/config/eslint/package.json ./packages/config/eslint/
COPY ./packages/config/tailwind/package.json ./packages/config/tailwind/
COPY ./packages/config/jest/package.json ./packages/config/jest/
COPY ./packages/config/typescript/package.json ./packages/config/typescript/
COPY ./packages/database/package.json ./packages/database/
COPY ./packages/ui/package.json ./packages/ui/
COPY package*.json ./
RUN pnpm i
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["pnpm", "run", "dev"]
