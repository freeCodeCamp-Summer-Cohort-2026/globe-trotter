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

## Prerequisites

- Node.js >= 24
- pnpm 11.22.0 (corepack enable && corepack prepare pnpm@11.22.0 --activate)
- Docker Desktop (for Postgres and Mailpit)

## How to get started

You may launch the app on your browser after setting it up locally or using Docker Compose. Once launched, you may use the app as a content creator or as a user. Depending on your chosen role, you will need to register and/or login to the app so that your content and/or your learning history may be saved.

## Quick Start

### 1. Clone the repo

To clone with HTTPS, copy the URL and run the following, replacing `CHANGE_ME_URL` with the copied URL:

```bash
git clone CHANGE_ME_URL
```

To clone with SSH, follow the instructions on GitHub. If you do not already have a public SSH key you will need to add a new one on your GitHub account.

### 2. Install dependencies

From the root of the repository, run:

```bash
pnpm i
```

### 3. Copy the example env file

```bash
cp .env.example .env
```

### 4. Configure your env variables

Edit the `.env` file (see the "Environment variables" section below)

### 5. Start up the postgres container

```bash
docker compose up -d postgres
```

### 6. Create the test databases

```bash
docker compose exec postgres psql -U globe-trotter -d postgres -c "CREATE DATABASE globe_trotter_test;"
docker compose exec postgres psql -U globe-trotter -d postgres -c "CREATE DATABASE globe_trotter_migration_test;"
```

### 7. Migrate the main database

```bash
cd packages/database
pnpm db:migrate
```

### 8. Migrate the test database

From `/packages/database`:

```bash
NODE_ENV=test pnpm db:migrate
```

### 9. Run the apps

```bash
pnpm dev
```

## Environment Variables

| Variable                      | Local default                                                                             | Notes                                                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                    | `development`                                                                             | Automatically set to `test` in tests - should be `development` locally                                                            |
| `POSTGRES_USER`               | `globe-trotter`                                                                           |                                                                                                                                   |
| `POSTGRES_PASSWORD`           | `CHANGE_ME_BEFORE_USE`                                                                    | You must choose a password to use locally                                                                                         |
| `POSTGRES_DB`                 | `globe_trotter`                                                                           |                                                                                                                                   |
| `DATABASE_URL`                | `postgres://globe-trotter:CHANGE_ME_PASSWORD@localhost:5432/globe_trotter`                | Replace `CHANGE_ME_PASSWORD` with your value for `POSTGRES_PASSWORD`                                                              |
| `TEST_DATABASE_URL`           | `postgres://globe-trotter:CHANGE_ME_PASSWORD@localhost:5432/globe_trotter_test`           | Replace `CHANGE_ME_PASSWORD` with your value for `POSTGRES_PASSWORD`                                                              |
| `MIGRATION_TEST_DATABASE_URL` | `postgres://globe-trotter:CHANGE_ME_PASSWORD@localhost:5432/globe_trotter_migration_test` | Replace `CHANGE_ME_PASSWORD` with your value for `POSTGRES_PASSWORD`                                                              |
| `WEB_URL`                     | `http://localhost:3000`                                                                   | Must match the web dev port                                                                                                       |
| `NEXT_PUBLIC_API_URL`         | `http://localhost:4000`                                                                   |                                                                                                                                   |
| `BETTER_AUTH_SECRET`          | `CHANGE_ME`                                                                               | Run `openssl rand -base64 32` in the terminal and replace `CHANGE_ME` with the output                                             |
| `BETTER_AUTH_URL`             | `http://localhost:4000`                                                                   |                                                                                                                                   |
| `GOOGLE_CLIENT_ID`            | `CHANGE_ME`                                                                               | See the "Google OAuth setup" section below                                                                                        |
| `GOOGLE_CLIENT_SECRET`        | `CHANGE_ME`                                                                               | See the "Google OAuth setup" section below                                                                                        |
| `EMAIL_PROVIDER`              | `smtp`                                                                                    | Can change to `stub` for testing; change to `resend` for production                                                               |
| `EMAIL_FROM`                  | `noreply@localhost`                                                                       | Do not change for now - there is no domain so Resend will not work - see the "Local email testing" section below for more details |
| `RESEND_API_KEY`              | `CHANGE_ME_API_KEY`                                                                       | Do not change for now - there is no domain so Resend will not work - see the "Local email testing" section below for more details |
| `SMTP_HOST`                   | `localhost`                                                                               |                                                                                                                                   |
| `SMTP_PORT`                   | `1025`                                                                                    |                                                                                                                                   |

## Running the Apps

### Option A: Docker Compose (full stack)

```bash
docker compose up --build
```

The web is on port `3000`; the API is on port `4000`.

### Option B: Local dev with hot reload

```bash
docker compose up -d postgres
pnpm --filter @repo/types dev       (run in terminal 1)
pnpm --filter @repo/database dev    (run in terminal 2)
pnpm dev                            (run in terminal 3)
```

The web is on port `3000`; the API is on port `4000`.

## Database scripts

- `pnpm db:health`
- `pnpm db:migrate`
- `pnpm db:generate` (after schema changes)
- `pnpm db:studio`
- `pnpm db:seed`

## Testing scripts

- `pnpm test` - unit tests (database + API) via Turbo
- `pnpm --filter api test:e2e` - E2E tests (requires migrated test DB + configured `.env`)
- `pnpm lint`
- `pnpm check-types`
- `pnpm build`

> Note: the e2e suite requires `TEST_DATABASE_URL` and `MIGRATION_TEST_DATABASE_URL` to point at migrated databases. See the "Test databases" section below.

## Test databases

2 test databases are needed:

- `globe_trotter_test` - used by unit and E2E tests
- `globe_trotter_migration_test` - used only by `/packages/database/src/__tests__/migrations.test.ts`

To create the 2 test databases, run:

```bash
docker compose exec postgres psql -U globe-trotter -d postgres -c "CREATE DATABASE globe_trotter_test;"
docker compose exec postgres psql -U globe-trotter -d postgres -c "CREATE DATABASE globe_trotter_migration_test;"
```

To migrate them, run:

```bash
cd packages/database
NODE_ENV=test pnpm db:migrate
```

## Local email testing

Emails sent locally are captured by Mailpit. Start the service with:

```bash
docker compose up -d mailpit
```

Then visit `http://localhost:8025` to view captured messages. The verification link in the email is clickable and completes the verification flow.

For production, set `EMAIL_PROVIDER=resend` and provide `RESEND_API_KEY`. The `EMAIL_FROM` address must be on a domain verified with Resend. As of the most recent update to this document, there is no verified domain for Globe Trotter, so please use either `stub` or `smtp` for development.

## Google OAuth setup

Create OAuth 2.0 credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), choose **Web application** as the application type, and add this authorized redirect URI:

```txt
http://localhost:4000/api/auth/callback/google
```

Copy the generated client ID and client secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`.

Better Auth uses the same user record when a Google identity and an email/password identity have the same verified email address. This lets users who sign up with either method use both sign-in methods. A Google user can set a password through the authenticated Better Auth `setPassword` action.

## File Structure

```txt
└── globetrotter/
    ├── apps/
    │   ├── api/
    │   │   ├── src/          app.controller.ts, app.module.ts, app.service.ts, main.ts
    │   │   │   ├── auth/           auth.module.ts, auth.ts, user-role.ts
    │   │   │   ├── database/          database.module.ts
    │   │   │   ├── dto/            session.dto.ts
    │   │   │   ├── email/          email.module.ts, email.service.ts
    │   │   │   │   └── emailTemplates/
    │   │   │   └── health/            health.controller.ts, health.module.ts
    │   │   └── test/            e2e-specs
    │   └── web/
    │       └── app/          layout.tsx, globals.css, page.tsx
    ├── packages/
    │   ├── config/
    │   │   ├── eslint/          base.js, library.js, nest.js, next.js, prettier-base.js, react-internal.js
    │   │   ├── jest/
    │   │   │   └── src/            base.ts, entry.ts, nest.ts, next.ts
    │   │   ├── tailwind/           shared-styles.css
    │   │   └── typescript/            base.json, nestjs.json, nextjs.json, react-library.json
    │   ├── database/            drizzle.config.ts, jest.config.js
    │   │   └── src/          client.ts, health.ts, seed.ts
    │   │       ├── __tests__/            client.test.ts, crud.test.ts, migrations.test.ts, schema.test.ts
    │   │       └── schema/            auth-schema.ts, labs.ts, modules.ts, tutorials.ts, user-progress.ts
    │   ├── types/
    │   │   └── src/          api.ts, interactions.ts, maps.ts, password.ts
    │   └── ui/            turbo.json
    │       └── src/
    │           ├── forms/
    │           ├── lib/            utils.ts
    │           └── maps/           data.ts, MapTemplate.tsx, mapTemplates.ts
    ├── .env.example
    ├── docker-compose.yml
    └── turbo.json
```

> Note: need to organize loose components in `/packages/ui/src`

## Troubleshooting

| Error message                      | Cause                                       | Fix                                                                                         |
| ---------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| "relation does not exist"          | test DB not migrated                        | `pnpm --filter @repo/database db:migrate`                                                   |
| "Cannot find module '@repo/types'" | types package not built                     | `pnpm --filter @repo/types dev`                                                             |
| `403 MISSING_OR_NULL_ORIGIN`       | WEB_URL doesn't match the web dev port      | Ensure that ports used in `WEB_URL` and dev script in `/apps/web/package.json` are matching |
| `EADDRINUSE :4000`                 | another API process is running              | For linux/macos use `kill -9 <process-id>`, for windows use `taskkill /PID <process-id> /F` |
| "database does not exist"          | Either main DB or test DBs were not created | Run the psql CREATE DATABASE cmds                                                           |
