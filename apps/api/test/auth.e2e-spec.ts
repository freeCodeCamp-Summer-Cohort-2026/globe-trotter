import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { db, sql } from '@repo/database';
import { AppModule } from '../src/app.module';

describe('Authentication and role based access (e2e)', () => {
  let app: INestApplication<App>;
  let learnerAgent: ReturnType<typeof request.agent>;
  let authorAgent: ReturnType<typeof request.agent>;

  const password = 'Password123!';
  let learnerEmail: string;
  let authorEmail: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication({ bodyParser: false });
    await app.init();

    const stamp = Date.now();
    learnerEmail = `e2e-learner-${stamp}@example.com`;
    authorEmail = `e2e-author-${stamp}@example.com`;

    // agent = stores cookies automatically ( for session )
    learnerAgent = request.agent(app.getHttpServer() as App);
    authorAgent = request.agent(app.getHttpServer() as App);

    // 1) Create a Learner
    const signUpLearner = await learnerAgent
      .post('/api/auth/sign-up/email')
      .set('Origin', 'http://localhost:3000')
      .send({ name: 'E2E Learner', email: learnerEmail, password });

    expect(signUpLearner.status).toBeLessThan(400);

    // 2) Create an Author, update it's role on DB
    const signUpAuthor = await authorAgent
      .post('/api/auth/sign-up/email')
      .set('Origin', 'http://localhost:3000')
      .send({ name: 'E2E Author', email: authorEmail, password });
    expect(signUpAuthor.status).toBeLessThan(400);
    await db.execute(
      sql`update "user" set role = 'author' where email = ${authorEmail}`,
    );

    // 3) SignIn for Learner and Author
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
    await db.execute(sql`delete from "user" where email like ${'e2e-%'}`);
    await app.close();
  });

  it.each([
    '/',
    '/profile',
    '/learner-dashboard',
    '/author-dashboard',
    '/all-modules',
    '/my-modules',
  ])('returns 401 for an unauthenticated request to %s', async (path) => {
    await request(app.getHttpServer() as App)
      .get(path)
      .expect(401);
  });

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
});
