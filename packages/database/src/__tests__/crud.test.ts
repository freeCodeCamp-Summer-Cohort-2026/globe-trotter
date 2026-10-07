import { eq } from 'drizzle-orm';
import { execSync } from 'node:child_process';
import { db, closeDatabase } from '../client';
import { user, modules } from '../schema';

const runMigrations = () => {
  execSync('pnpm exec drizzle-kit migrate', {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.TEST_DATABASE_URL,
    },
  });
};

beforeAll(() => {
  runMigrations();
});

afterAll(async () => {
  await closeDatabase();
});

describe('Database CRUD operations', () => {
  it('should insert and query a user', async () => {
    const email = `test-${Date.now()}@example.com`;

    const [testUser] = await db
      .insert(user)
      .values({
        id: `test-user-${Date.now()}`,
        name: 'Test User',
        email,
        role: 'learner',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!testUser) {
      throw new Error('User was not returned after insert');
    }

    expect(testUser.email).toBe(email);
    expect(testUser.role).toBe('learner');

    const result = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    expect(result).toHaveLength(1);

    const queriedUser = result[0];

    if (!queriedUser) {
      throw new Error('User was not found after insert');
    }

    expect(queriedUser.email).toBe(email);
  });

  it('should insert and query a module', async () => {
    const email = `module-test-${Date.now()}@example.com`;

    const [author] = await db
      .insert(user)
      .values({
        id: `author-${Date.now()}`,
        name: 'Test Author',
        email,
        role: 'author',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!author) {
      throw new Error('Author was not returned after insert');
    }

    const [module] = await db
      .insert(modules)
      .values({
        authorId: author.id,
        title: 'Test Module',
        description: 'Test module description',
        orderIndex: 1,
        thumbnailUrl: 'https://example.com/thumbnail.png',
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!module) {
      throw new Error('Module was not returned after insert');
    }

    expect(module.title).toBe('Test Module');
    expect(module.authorId).toBe(author.id);

    const result = await db
      .select()
      .from(modules)
      .where(eq(modules.id, module.id));

    expect(result).toHaveLength(1);

    const queriedModule = result[0];

    if (!queriedModule) {
      throw new Error('Module was not found after insert');
    }

    expect(queriedModule.title).toBe('Test Module');
    expect(queriedModule.authorId).toBe(author.id);
  });
});