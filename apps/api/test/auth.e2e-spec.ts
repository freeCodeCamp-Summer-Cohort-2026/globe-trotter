import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { db, sql, inArray, eq } from '@repo/database';
import {
  user as userTable,
  session as sessionTable,
} from '@repo/database/src/schema';
import { AppModule } from '../src/app.module';

// TODO: Temporary e2e test users. Relocate to a shared constants file in a later PR.
const learnerEmail: string = 'e2e-learner@example.com';
const authorEmail: string = 'e2e-author@example.com';

const e2eTestUsers = [learnerEmail, authorEmail];

describe('Authentication and role based access (e2e)', () => {
  let app: INestApplication<App>;
  let learnerAgent: ReturnType<typeof request.agent>;
  let authorAgent: ReturnType<typeof request.agent>;

  const password = 'Password123!';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication({ bodyParser: false });
    await app.init();

    // Agents automatically retain session cookies between requests.
    learnerAgent = request.agent(app.getHttpServer() as App);
    authorAgent = request.agent(app.getHttpServer() as App);
    const signUpLearner = await learnerAgent
      .post('/api/auth/sign-up/email')
      .set('Origin', 'http://localhost:3000')
      .send({ name: 'E2E Learner', email: learnerEmail, password });

    expect(signUpLearner.status).toBeLessThan(400);


    const signUpAuthor = await authorAgent
      .post('/api/auth/sign-up/email')
      .set('Origin', 'http://localhost:3000')
      .send({ name: 'E2E Author', email: authorEmail, password });

    expect(signUpAuthor.status).toBeLessThan(400);
    await db.execute(
      sql`update "user" set email_verified = true where email = ${learnerEmail}`,
    );

    await db.execute(
      sql`update "user" set email_verified = true where email = ${authorEmail}`,
    );

    await db.execute(
      sql`update "user" set role = 'author' where email = ${authorEmail}`,
    );

    const signInLearner = await learnerAgent
      .post('/api/auth/sign-in/email')
      .set('Origin', 'http://localhost:3000')
      .send({ email: learnerEmail, password });

    expect(signInLearner.status).toBeLessThan(400);

    const signInAuthor = await authorAgent
      .post('/api/auth/sign-in/email')
      .set('Origin', 'http://localhost:3000')
      .send({ email: authorEmail, password });

    expect(signInAuthor.status).toBeLessThan(400);
  });

  afterAll(async () => {
    try {
      await db.delete(userTable).where(inArray(userTable.email, e2eTestUsers));
    } catch (err) {
      console.error('Failed to clean up e2e test users:', err);
    }

    try {
      await app?.close();
    } catch (err) {
      console.error('App failed to close:', err);
    }
  });

  it.each([
    '/',
    '/profile',
    '/learner-dashboard',
    '/author-dashboard',
    '/all-modules',
    '/my-modules',
  ])(
    'returns 401 for an unauthenticated request to %s',
    async (path: string) => {
      await request(app.getHttpServer() as App).get(path).expect(401);
    },
  );

  it('does not require authentication for an @AllowAnonymous() route', async () => {
    const response = await request(app.getHttpServer() as App).get('/health');

    expect(response.status).not.toBe(401);
  });

  it('learner accessing /all-modules returns 200', async () => {
    await learnerAgent.get('/all-modules').expect(200);
  });

  it('learner accessing /my-modules returns 403', async () => {
    await learnerAgent.get('/my-modules').expect(403);
  });

  it('author accessing /all-modules returns 200', async () => {
    await authorAgent.get('/all-modules').expect(200);
  });

  it('author accessing /my-modules returns 200', async () => {
    await authorAgent.get('/my-modules').expect(200);
  });

  it('sign-out clears cookies, deletes the session, and rejects the old cookie', async () => {
    const logoutAgent = request.agent(app.getHttpServer() as App);

    const signIn = await logoutAgent
      .post('/api/auth/sign-in/email')
      .set('Origin', 'http://localhost:3000')
      .send({ email: learnerEmail, password });

    expect(signIn.status).toBeLessThan(400);

    const cookies = signIn.headers['set-cookie'] as string[] | undefined;
    expect(cookies).toBeDefined();

    if (!cookies?.length) {
      throw new Error('Sign-in did not return session cookies');
    }

    // Save the original cookie to check that it becomes invalid after logout.
    const oldCookie = cookies.map((cookie) => cookie.split(';')[0]).join('; ');

    const users = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.email, learnerEmail));

    expect(users).toHaveLength(1);
    const userRecord = users[0];

    if (!userRecord) {
      throw new Error(`Test user not found: ${learnerEmail}`);
    }

    const userId = userRecord.id;

    const sessionsBefore = await db
      .select({ id: sessionTable.id })
      .from(sessionTable)
      .where(eq(sessionTable.userId, userId));

    const signOut = await logoutAgent
      .post('/api/auth/sign-out')
      .set('Origin', 'http://localhost:3000');

    expect(signOut.status).toBeLessThan(400);

    const clearedCookies = signOut.headers['set-cookie'] as
      | string[]
      | undefined;

    expect(clearedCookies).toBeDefined();
    expect(
      clearedCookies?.some(
        (cookie) =>
          /session_token/i.test(cookie) &&
          (/max-age=0/i.test(cookie) ||
          /expires=Thu,\s*01\s*Jan\s*1970/i.test(cookie)),
      ),
    ).toBe(true);

    await request(app.getHttpServer() as App)
      .get('/profile')
      .set('Cookie', oldCookie)
      .expect(401);

    const sessionsAfter = await db
      .select({ id: sessionTable.id })
      .from(sessionTable)
      .where(eq(sessionTable.userId, userId));

    expect(sessionsAfter).toHaveLength(sessionsBefore.length - 1);
  });

  it('allows a user to revoke all their sessions', async () => {
    const users = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.email, learnerEmail));

    expect(users).toHaveLength(1);
    const userRecord = users[0];

    if (!userRecord) {
      throw new Error(`Test user not found: ${learnerEmail}`);
    }

    const userId = userRecord.id;

    /**
     * Scoped cleanup: sessions from other tests (including the shared
     * beforeAll agents) would otherwise pollute the count below.
     * Do NOT move this into a global beforeEach - that would also wipe
     * learnerAgent and authorAgent sessions used by role tests.
     */
    await db
      .delete(sessionTable)
      .where(eq(sessionTable.userId, userId));

    const firstAgent = request.agent(app.getHttpServer() as App);
    const secondAgent = request.agent(app.getHttpServer() as App);

    for (const agent of [firstAgent, secondAgent]) {
      const signIn = await agent
        .post('/api/auth/sign-in/email')
        .set('Origin', 'http://localhost:3000')
        .send({ email: learnerEmail, password });

      expect(signIn.status).toBeLessThan(400);
    }

    const revoke = await firstAgent
      .post('/api/auth/revoke-sessions')
      .set('Origin', 'http://localhost:3000');

    expect(revoke.status).toBeLessThan(400);
    expect(revoke.body.status).toBe(true);

    await firstAgent.get('/profile').expect(401);
    await secondAgent.get('/profile').expect(401);

    const remainingSessions = await db
      .select({ id: sessionTable.id })
      .from(sessionTable)
      .where(eq(sessionTable.userId, userId));

    expect(remainingSessions).toHaveLength(0);
  });
});
