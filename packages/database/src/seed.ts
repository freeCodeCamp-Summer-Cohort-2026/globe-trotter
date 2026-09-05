import { closeDatabase } from './client';

async function seed() {
  console.log('No seed data configured yet.');
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });