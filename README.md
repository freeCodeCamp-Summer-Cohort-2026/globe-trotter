# Globe Trotter

Globe Trotter is a platform for teaching any general geography topic (starting with world geography - countries, capitals, flags) through short two-minute tutorials and longer open-ended labs. It's a general-purpose teaching engine, not a fixed geography curriculum.

Learners interact with a live map and other visual/spatial elements directly in the browser, and use the same to improve their knowledge of world geography. Users may also use this app to author content and create their own learning modules to contribute to the larger community of geography learners.

## Tech Stack

**Frontend**: TypeScript + React + Next.js + Tailwind CSS

**Backend** - TypeScript + Nest.js

**Database** - PostgreSQL + Drizzle

**Interactive map** - Maplibre GL JS, react-map-gl

**Auth**: Better Auth with email/password and Google OAuth

**Tests**: Jest

## How to get started

You may launch the app on your browser after setting it up locally or using Docker Compose. Once launched, you may use the app as a content creator or as a user. Depending on your chosen role, you will need to register and/or login to the app so that your content and/or your learning history may be saved.

## Local Setup

### 1. Configure environment

Copy the example file:

```bash
cp .env.example .env
```

Generate a secret for Better Auth and set it as `BETTER_AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Set `BETTER_AUTH_URL` to `http://localhost:3000` for local development. Create OAuth 2.0 credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), choose **Web application** as the application type, and add this authorized redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

Copy the generated client ID and client secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`.

Better Auth uses the same user record when a Google identity and an email/password identity have the same verified email address. This lets users who sign up with either method use both sign-in methods. A Google user can set a password through the authenticated Better Auth `setPassword` action.

### 2. Start PostgreSQL

To start the full stack (database + API + web) as a build:

```bash
docker compose up --build
```

Or, if you prefer running the apps on your host for hot reload, leave only Postgres running in Docker and start the apps with `pnpm dev` from the repo root.

```bash
docker compose up -d postgres
```

### 3. Verify the connection

Run a health check in `/packages/database`:

```bash
cd packages/database
pnpm db:health
```

A successful run prints `Database connection healthy` and exits with code 0. If it exits non-zero, the error message indicates whether `DATABASE_URL` is missing, malformed, or pointing at an unreachable database.

### 4. Run migrations

Also in `/packages/database`, run:

```bash
pnpm db:migrate
```

> **Note:** Seeding is not yet wired up (tracked separately). Once available, it will be runnable with `pnpm db:seed` from `/packages/database`.

## File Structure

```
globetrotter/
├── apps/
|    └── api/
|    |   ├── src/       app.controller.ts, app.module.ts, app.service.ts, main.ts
|    |   |── test/      app.e2e-spec.ts, jest-e2e.json
|    |── web/
│       ├── app/        Layout, Frontend
│       └── page.js
├── packages/
     |── config/
        |── eslint/     Prettier
            |── jest/
               ├── src/
        |── tailwind/   Tailwind CSS
        |── typescript/
     |── ui/
        ├── src/
```
