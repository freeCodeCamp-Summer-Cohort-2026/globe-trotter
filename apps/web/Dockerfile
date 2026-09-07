FROM node:24-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm i -g pnpm
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json
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

FROM node:24-alpine AS runner
WORKDIR /app
RUN npm i -g pnpm
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app .
EXPOSE 3001
CMD ["pnpm", "--filter", "web", "run", "start"]

#dev mode for hot reload
FROM node:24-alpine AS dev
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm i -g pnpm
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json
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
