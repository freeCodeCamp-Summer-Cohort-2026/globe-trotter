import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { db, eq, inArray, schema, sql } from '@repo/database';
import type { LabDetail, LabGoal } from '@repo/types';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

const origin = 'http://localhost:3000';
const password = 'Password123!';
const learnerEmail = 'e2e-labs-learner@example.com';
const authorEmail = 'e2e-labs-author@example.com';
const e2eTestUsers = [learnerEmail, authorEmail];

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
  let learnerAgent: ReturnType<typeof request.agent>;
  let authorAgent: ReturnType<typeof request.agent>;
  let moduleId: string | undefined;
  let labId: string;
  let unpublishedLabId: string;

  const signUpAndSignIn = async (
    email: string,
    name: string,
    role: 'learner' | 'author',
  ) => {
    const agent = request.agent(app.getHttpServer());

    const signUp = await agent
      .post('/api/auth/sign-up/email')
      .set('Origin', origin)
      .send({ name, email, password });
    expect(signUp.status).toBeLessThan(400);

    await db.execute(
      sql`update "user" set email_verified = true, role = ${role} where email = ${email}`,
    );

    const signIn = await agent
      .post('/api/auth/sign-in/email')
      .set('Origin', origin)
      .send({ email, password });
    expect(signIn.status).toBeLessThan(400);

    return agent;
  };

  const insertLab = async (values: {
    title: string;
    orderIndex: number;
    isPublished: boolean;
  }) => {
    const [lab] = await db
      .insert(schema.labs)
      .values({
        moduleId: moduleId as string,
        description: 'Find your way around Asia.',
        goals,
        allowedAttempts: 3,
        createdAt: timestamp,
        updatedAt: timestamp,
        ...values,
      })
      .returning({ id: schema.labs.id });

    if (!lab) {
      throw new Error('Lab was not returned after insert');
    }

    return lab.id;
  };

  const expectedLabDetail = (): LabDetail => ({
    id: labId,
    moduleId: moduleId as string,
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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication({ bodyParser: false });
    await app.init();

    // Clears users left behind by an interrupted run so sign-up starts fresh.
    await db
      .delete(schema.user)
      .where(inArray(schema.user.email, e2eTestUsers));

    learnerAgent = await signUpAndSignIn(
      learnerEmail,
      'E2E Labs Learner',
      'learner',
    );
    authorAgent = await signUpAndSignIn(
      authorEmail,
      'E2E Labs Author',
      'author',
    );

    const [module] = await db
      .insert(schema.modules)
      .values({ title: 'E2E Labs Module' })
      .returning({ id: schema.modules.id });

    if (!module) {
      throw new Error('Module was not returned after insert');
    }

    moduleId = module.id;

    labId = await insertLab({
      title: 'Countries of Asia',
      orderIndex: 1,
      isPublished: true,
    });
    unpublishedLabId = await insertLab({
      title: 'Draft Lab',
      orderIndex: 2,
      isPublished: false,
    });
  });

  afterAll(async () => {
    try {
      // Labs are removed by the ON DELETE CASCADE from modules.
      if (moduleId) {
        await db.delete(schema.modules).where(eq(schema.modules.id, moduleId));
      }
      await db
        .delete(schema.user)
        .where(inArray(schema.user.email, e2eTestUsers));
    } catch (err) {
      console.error('Failed to clean up e2e labs data:', err);
    }

    try {
      await app?.close();
    } catch (err) {
      console.error('App failed to close:', err);
    }
  });

  it('returns 401 for an unauthenticated request', async () => {
    await request(app.getHttpServer()).get(`/labs/${labId}`).expect(401);
  });

  it('returns the lab with the expected response shape to a learner', async () => {
    const response = await learnerAgent.get(`/labs/${labId}`).expect(200);

    expect(response.body).toEqual(expectedLabDetail());
  });

  it('returns the lab to an author', async () => {
    const response = await authorAgent.get(`/labs/${labId}`).expect(200);

    expect(response.body).toEqual(expectedLabDetail());
  });

  it('does not return `expected` on any goal', async () => {
    const response = await learnerAgent.get(`/labs/${labId}`).expect(200);

    const lab = response.body as LabDetail;

    expect(lab.goals).toHaveLength(goals.length);
    for (const goal of lab.goals) {
      expect(goal).not.toHaveProperty('expected');
    }
    expect(response.text).not.toContain('"expected"');
  });

  it('returns 404 for an unpublished lab', async () => {
    await learnerAgent.get(`/labs/${unpublishedLabId}`).expect(404);
  });

  it('returns 404 for a valid UUID that does not exist', async () => {
    await learnerAgent.get(`/labs/${randomUUID()}`).expect(404);
  });

  it('returns 400 for a malformed UUID', async () => {
    await learnerAgent.get('/labs/not-a-uuid').expect(400);
  });
});
