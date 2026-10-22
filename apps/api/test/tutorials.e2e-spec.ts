import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { db, eq, modules, tutorials } from '@repo/database';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

const moduleId = '5d20c096-f5df-4c36-ae3e-b8a6e32a6e28';
const tutorialId = 'd06c5198-7d01-4d14-a2f9-88f5319529ed';
const missingTutorialId = '5904d28c-cc9e-4f4e-8c4a-c9f698e5cf7e';
const tipTapContent = { type: 'doc', content: [] };

describe('GET /tutorials/:id (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication({ bodyParser: false });
    await app.init();

    const timestamp = new Date('2026-01-01T12:00:00.000Z');
    await db.delete(modules).where(eq(modules.id, moduleId));
    await db.insert(modules).values({
      id: moduleId,
      title: 'European Geography',
      description: 'An introduction to Europe.',
      orderIndex: 1,
      thumbnailUrl: 'https://example.com/europe.png',
      isPublished: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await db.insert(tutorials).values({
      id: tutorialId,
      moduleId,
      title: 'Introduction to Europe',
      description: null,
      content: JSON.stringify(tipTapContent),
      estimatedDuration: 15,
      orderIndex: 1,
      isPublished: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });

  afterAll(async () => {
    await db.delete(modules).where(eq(modules.id, moduleId));
    await app.close();
  });

  it('returns the full tutorial record with parsed content', async () => {
    const response = await request(app.getHttpServer() as App)
      .get(`/tutorials/${tutorialId}`)
      .expect(200);

    expect(response.body).toEqual({
      id: tutorialId,
      moduleId,
      title: 'Introduction to Europe',
      description: null,
      content: tipTapContent,
      estimatedDuration: 15,
      orderIndex: 1,
      isPublished: true,
      createdAt: '2026-01-01T12:00:00.000Z',
      updatedAt: '2026-01-01T12:00:00.000Z',
    });
  });

  it('returns 404 for a valid UUID that does not exist', async () => {
    await request(app.getHttpServer() as App)
      .get(`/tutorials/${missingTutorialId}`)
      .expect(404);
  });

  it('returns 400 for a malformed UUID', async () => {
    await request(app.getHttpServer() as App)
      .get('/tutorials/not-a-uuid')
      .expect(400);
  });
});
