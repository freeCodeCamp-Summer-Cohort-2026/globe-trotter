import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Authentication and role based access (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each(['/', '/profile', '/learner-dashboard', '/author-dashboard'])(
    'returns 401 for an unauthenticated request to %s',
    async (path) => {
      await request(app.getHttpServer()).get(path).expect(401);
    },
  );

  it('does not require authentication for an @AllowAnonymous() route', async () => {
    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).not.toBe(401);
  });
});
