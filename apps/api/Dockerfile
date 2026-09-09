FROM node:24-alpine AS prod
WORKDIR /app
RUN npm i -g pnpm
# Copy package.json files before source code - Docker caches each layer.
# If only source changes, pnpm install layer is reused and build is faster
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY ./packages/config/eslint/package.json ./packages/config/eslint/
COPY ./packages/config/tailwind/package.json ./packages/config/tailwind/
COPY ./packages/config/jest/package.json ./packages/config/jest/
COPY ./packages/config/typescript/package.json ./packages/config/typescript/
COPY ./packages/database/package.json ./packages/database/
COPY ./packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm i --frozen-lockfile
# Copy source code in a seperate layer after dependencies are installed
COPY . .
WORKDIR /app/apps/api
RUN pnpm run build
EXPOSE 4000
CMD ["node", "dist/main"]

# Hot reloading
FROM node:24-alpine AS dev
WORKDIR /app
RUN npm i -g pnpm
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY ./packages/config/eslint/package.json ./packages/config/eslint/
COPY ./packages/config/tailwind/package.json ./packages/config/tailwind/
COPY ./packages/config/jest/package.json ./packages/config/jest/
COPY ./packages/config/typescript/package.json ./packages/config/typescript/
COPY ./packages/database/package.json ./packages/database/
COPY ./packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm i
COPY . .
CMD ["pnpm", "run", "dev"]