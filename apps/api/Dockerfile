FROM node:20-alpine AS prod
WORKDIR /app
RUN npm i pnpm -g
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY ./packages/config/eslint/package.json ./packages/config/eslint/
COPY ./packages/config/tailwind/package.json ./packages/config/tailwind/
COPY ./packages/config/jest/package.json ./packages/config/jest/
COPY ./packages/config/typescript/package.json ./packages/config/typescript/
COPY ./packages/database/package.json ./packages/database/
COPY ./packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./
RUN pnpm i
COPY . .
RUN pnpm run build
EXPOSE 4000
CMD ["node", "dist/main"]

# Hot reloading
FROM node:20-alpine AS dev
WORKDIR /app
ENV port=4000
ENV CORS_ORIGIN=http://localhost:3001
ENV POSTGRES_URI=postgres://localhost:27017/globe-trotter
ENV JWT_SECRET=replace-with-a-long-random-string
RUN npm i pnpm
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/api/package.json ./
COPY ./packages/config/eslint/package.json ./packages/config/eslint/
COPY ./packages/config/tailwind/package.json ./packages/config/tailwind/
COPY ./packages/config/jest/package.json ./packages/config/jest/
COPY ./packages/config/typescript/package.json ./packages/config/typescript/
COPY ./packages/database/package.json ./packages/database/
COPY ./packages/ui/package.json ./packages/ui/
COPY package*.json ./
RUN pnpm i
COPY . .
CMD ["pnpm", "run", "dev"]