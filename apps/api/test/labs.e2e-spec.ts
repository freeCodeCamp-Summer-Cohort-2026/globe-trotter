import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { db, eq, schema } from '@repo/database';
import type { LabDetail, LabGoal } from '@repo/types';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

const timestamp = new Date('2026-01-01T12:00:00.000Z');

const goals: LabGoal[] = [
  {
    id: 'goal-1',
    type: 'region_selection',
    description: 'Select Japan on the map',
    expected: { iso_a2: 'JP' },
    hint: 'It is an island nation in East Asia',
  },
  {
    id: 'goal-2',
    type: 'path_drawing',
    description: 'Trace the Yangtze River',
    expected: {
      coordinates: [
        [91.1, 33.4],
        [121.9, 31.4],
      ],
      tolerance_meters: 5000,
    },
  },
  {
    id: 'goal-3',
    type: 'polygon_drawing',
    description: 'Outline Sri Lanka',
    expected: {
      coordinates: [
        [
          [79.7, 9.8],
          [81.9, 7.5],
          [80.6, 5.9],
          [79.7, 9.8],
        ],
      ],
      tolerance_meters: 10000,
    },
  },
  {
    id: 'goal-4',
    type: 'text_input',
    description: 'Name the capital of South Korea',
    expected: { value: 'Seoul', caseSensitive: false },
  },
  {
    id: 'goal-5',
    type: 'multiple_choice',
    description: 'Which is the most populous country in Asia?',
    options: ['Indonesia', 'India', 'Japan'],
    expected: { correctIndex: 1 },
    hint: 'Its capital is New Delhi',
  },
];

describe('GET /labs/:id (e2e)', () => {
  let app: INestApplication<App>;
  let moduleId: string | undefined;
  let labId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication({ bodyParser: false });
    await app.init();

    const [module] = await db
      .insert(schema.modules)
      .values({ title: 'E2E Labs Module' })
      .returning({ id: schema.modules.id });

    if (!module) {
      throw new Error('Module was not returned after insert');
    }

    moduleId = module.id;

    const [lab] = await db
      .insert(schema.labs)
      .values({
        moduleId,
        title: 'Countries of Asia',
        description: 'Find your way around Asia.',
        goals,
        allowedAttempts: 3,
        orderIndex: 1,
        isPublished: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning({ id: schema.labs.id });

    if (!lab) {
      throw new Error('Lab was not returned after insert');
    }

    labId = lab.id;
  });

  afterAll(async () => {
    try {
      // Labs are removed by the ON DELETE CASCADE from modules.
      if (moduleId) {
        await db.delete(schema.modules).where(eq(schema.modules.id, moduleId));
      }
    } catch (err) {
      console.error('Failed to clean up e2e labs data:', err);
    }

    try {
      await app?.close();
    } catch (err) {
      console.error('App failed to close:', err);
    }
  });

  // No session cookie is sent: the route must be reachable anonymously.
  it('returns the lab with the expected response shape', async () => {
    const response = await request(app.getHttpServer())
      .get(`/labs/${labId}`)
      .expect(200);

    expect(response.body).toEqual({
      id: labId,
      moduleId,
      title: 'Countries of Asia',
      description: 'Find your way around Asia.',
      goals: [
        {
          id: 'goal-1',
          type: 'region_selection',
          description: 'Select Japan on the map',
          hint: 'It is an island nation in East Asia',
        },
        {
          id: 'goal-2',
          type: 'path_drawing',
          description: 'Trace the Yangtze River',
        },
        {
          id: 'goal-3',
          type: 'polygon_drawing',
          description: 'Outline Sri Lanka',
        },
        {
          id: 'goal-4',
          type: 'text_input',
          description: 'Name the capital of South Korea',
        },
        {
          id: 'goal-5',
          type: 'multiple_choice',
          description: 'Which is the most populous country in Asia?',
          options: ['Indonesia', 'India', 'Japan'],
          hint: 'Its capital is New Delhi',
        },
      ],
      allowedAttempts: 3,
      orderIndex: 1,
      isPublished: true,
      createdAt: '2026-01-01T12:00:00.000Z',
      updatedAt: '2026-01-01T12:00:00.000Z',
    });
  });

  it('does not return `expected` on any goal', async () => {
    const response = await request(app.getHttpServer())
      .get(`/labs/${labId}`)
      .expect(200);

    const lab = response.body as LabDetail;

    expect(lab.goals).toHaveLength(goals.length);
    for (const goal of lab.goals) {
      expect(goal).not.toHaveProperty('expected');
    }
    expect(response.text).not.toContain('"expected"');
  });

  it('returns 404 for a valid UUID that does not exist', async () => {
    await request(app.getHttpServer()).get(`/labs/${randomUUID()}`).expect(404);
  });

  it('returns 400 for a malformed UUID', async () => {
    await request(app.getHttpServer()).get('/labs/not-a-uuid').expect(400);
  });
});
