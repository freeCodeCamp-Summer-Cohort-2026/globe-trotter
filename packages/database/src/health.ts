import { sql } from 'drizzle-orm';

import { closeDatabase, db } from './client';

async function main() {
  try {
    await db.execute(sql`SELECT 1`);

    console.log('Database connection healthy');
    process.exitCode = 0;
  } catch (error) {
    console.error('Database health check failed:', error);
    process.exitCode = 1;
  } finally {
    try {
      await closeDatabase();
    } catch (err) {
      console.error('Failed to close DB pool:', err);
    }
  }
}

void main();
