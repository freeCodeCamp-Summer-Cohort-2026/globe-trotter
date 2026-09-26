import { execSync } from 'node:child_process';
import { Client } from 'pg';

let migrationSucceeded = false;

const runMigrations = () => {
  execSync('pnpm exec drizzle-kit migrate', {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.MIGRATION_TEST_DATABASE_URL,
    },
  });
};

const client = new Client({
  connectionString: process.env.MIGRATION_TEST_DATABASE_URL,
});

beforeAll(async () => {
  runMigrations();

  try {
    await client.connect();
    migrationSucceeded = true;
  } catch (error) {
    throw new Error(
      `Failed to connect to the test database: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
});

it('should apply all database migrations', async () => {
  const result = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  `);

  const tableNames = result.rows.map((row) => row.table_name);

  expect(tableNames).toEqual(
    expect.arrayContaining([
      'user',
      'session',
      'account',
      'verification',
      'modules',
      'tutorials',
      'labs',
      'user_progress',
    ]),
  );
});

afterAll(async () => {
  if (!migrationSucceeded) {
    await client.end().catch(() => {});
    return;
  }
  
  const testDatabaseUrl = process.env.MIGRATION_TEST_DATABASE_URL;

  if (!testDatabaseUrl) {
    throw new Error(
      'MIGRATION_TEST_DATABASE_URL is required for migration database tests',
);
  }

  const url = new URL(testDatabaseUrl);
  const dbName = url.pathname.replace(/^\//, '');

  if (dbName !== 'globe_trotter_migration_test') {
    throw new Error(
      `I refuse to run a destructive clean-up against a non-test database! DB name: ${dbName}`,
    );
  }

  await client.query('DROP SCHEMA public CASCADE');
  await client.query('DROP SCHEMA drizzle CASCADE');
  await client.query('CREATE SCHEMA public');
  await client.end();
});