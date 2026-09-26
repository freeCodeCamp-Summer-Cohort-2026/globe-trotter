import { Pool } from "pg";

import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

const isTest = process.env.NODE_ENV === 'test';

const databaseUrl = isTest
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
const betterAuthUrl = process.env.BETTER_AUTH_URL;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!databaseUrl) {
  throw new Error(
    isTest
      ? 'TEST_DATABASE_URL is required when NODE_ENV=test'
      : 'DATABASE_URL environment variable is not set',
  );
}

if (!isTest) {
  if (!betterAuthSecret) {
    throw new Error("BETTER_AUTH_SECRET environment variable is not set");
  }

  if (!betterAuthUrl) {
    throw new Error("BETTER_AUTH_URL environment variable is not set");
  }

  if (googleClientId && !googleClientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_SECRET environment variable is required when GOOGLE_CLIENT_ID is set",
    );
  }

  if (googleClientSecret && !googleClientId) {
    throw new Error(
      "GOOGLE_CLIENT_ID environment variable is required when GOOGLE_CLIENT_SECRET is set",
    );
  }
}

try {
  const url = new URL(databaseUrl);

  if (
    (url.protocol !== "postgresql:" && url.protocol !== "postgres:") ||
    !url.hostname ||
    !url.username
  ) {
    throw new Error();
  }
} catch (error) {
  throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL", {
    cause: error,
  });
}

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export const db = drizzle(pool, { schema });

export type Db = typeof db;

//? Close db should only run once - prevent multiple runs

let isClosed = false;

export const closeDatabase = async () => {
  if (isClosed) return;
  isClosed = true;
  await pool.end();
};