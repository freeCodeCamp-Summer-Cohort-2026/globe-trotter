import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

try {
  const url = new URL(databaseUrl);

  if (
    (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') ||
    !url.hostname ||
    !url.username
  ) {
    throw new Error();
  }
} catch (error) {
  throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL', {
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
}
