import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { db, eq, inArray, schema, sql } from '@repo/database';
import {
  LAB_FAILURE_MESSAGES,
  LAB_SUCCESS_MESSAGES,
  type LabAnswer,
  type LabGoal,
  type LabSubmissionResult,
} from '@repo/types';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

const origin = 'http://localhost:3000';
const password = 'Password123!';
const learnerEmail = 'e2e-labs-submit-learner@example.com';
const authorEmail = 'e2e-labs-submit-author@example.com';
const e2eTestUsers = [learnerEmail, authorEmail];

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

const correctAnswers: Record<string, LabAnswer> = {
  'goal-1': 'jp',
  'goal-2': [
    [91.12, 33.41],
    // Great circle midpoint of the expected segment.
    [106.67482048678679, 33.354933821706545],
    [121.88, 31.39],
  ],
  'goal-3': [
    [
      [79.72, 9.79],
      [81.88, 7.51],
      [80.6, 5.92],
      [79.72, 9.79],
    ],
  ],
  'goal-4': ' seoul ',
  'goal-5': 1,
};

const incorrectAnswers: Record<string, LabAnswer> = {
  ...correctAnswers,
  'goal-1': 'CN',
  'goal-2': [
    [91.1, 33.4],
    // ~107 km from the expected line.
    [106.5, 32.4],
    [121.9, 31.4],
  ],
  'goal-4': 'Busan',
};

describe('POST /labs/:id/submit (e2e)', () => {
  let app: INestApplication<App>;
  let learnerAgent: ReturnType<typeof request.agent>;
  let authorAgent: ReturnType<typeof request.agent>;
  let learnerId: string;
  let authorId: string;
  let moduleId: string | undefined;
  let nextOrderIndex = 1;

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

    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, email),
      columns: { id: true },
    });

    if (!user) {
      throw new Error(`User ${email} was not found after sign-up`);
    }

    return { agent, userId: user.id };
  };

  // Each test gets its own lab so attempt counts do not leak between tests.
  const insertLab = async ({
    allowedAttempts,
    isPublished = true,
  }: {
    allowedAttempts: number | null;
    isPublished?: boolean;
  }) => {
    const orderIndex = nextOrderIndex++;
    const [lab] = await db
      .insert(schema.labs)
      .values({
        moduleId: moduleId as string,
        title: `Submission Lab ${orderIndex}`,
        goals,
        allowedAttempts,
        orderIndex,
        isPublished,
      })
      .returning({ id: schema.labs.id });

    if (!lab) {
      throw new Error('Lab was not returned after insert');
    }

    return lab.id;
  };

  const getProgress = (labId: string) =>
    db.query.userProgress.findMany({
      where: eq(schema.userProgress.labId, labId),
      columns: {
        userId: true,
        moduleId: true,
        tutorialId: true,
        status: true,
        attempts: true,
      },
    });

  const submit = (
    agent: ReturnType<typeof request.agent>,
    labId: string,
    answers: Record<string, LabAnswer>,
  ) => agent.post(`/labs/${labId}/submit`).send({ answers });

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

    ({ agent: learnerAgent, userId: learnerId } = await signUpAndSignIn(
      learnerEmail,
      'E2E Labs Submit Learner',
      'learner',
    ));
    ({ agent: authorAgent, userId: authorId } = await signUpAndSignIn(
      authorEmail,
      'E2E Labs Submit Author',
      'author',
    ));

    const [module] = await db
      .insert(schema.modules)
      .values({ title: 'E2E Labs Submit Module' })
      .returning({ id: schema.modules.id });

    if (!module) {
      throw new Error('Module was not returned after insert');
    }

    moduleId = module.id;
  });

  afterAll(async () => {
    try {
      // Labs and user_progress rows are removed by ON DELETE CASCADE.
      if (moduleId) {
        await db.delete(schema.modules).where(eq(schema.modules.id, moduleId));
      }
      await db
        .delete(schema.user)
        .where(inArray(schema.user.email, e2eTestUsers));
    } catch (err) {
      console.error('Failed to clean up e2e lab submission data:', err);
    }

    try {
      await app?.close();
    } catch (err) {
      console.error('App failed to close:', err);
    }
  });

  it('returns 401 for an unauthenticated request', async () => {
    const labId = await insertLab({ allowedAttempts: 3 });

    await request(app.getHttpServer())
      .post(`/labs/${labId}/submit`)
      .send({ answers: correctAnswers })
      .expect(401);
    expect(await getProgress(labId)).toEqual([]);
  });

  it('evaluates a passing submission and marks the lab as completed', async () => {
    const labId = await insertLab({ allowedAttempts: 3 });

    const response = await submit(learnerAgent, labId, correctAnswers).expect(
      200,
    );
    const result = response.body as LabSubmissionResult;

    expect(result).toEqual({
      labId,
      passed: true,
      message: expect.any(String),
      goals: goals.map((goal) => ({ goalId: goal.id, passed: true })),
      attemptsRemaining: 2,
    });
    expect(LAB_SUCCESS_MESSAGES).toContain(result.message);
    expect(await getProgress(labId)).toEqual([
      {
        userId: learnerId,
        moduleId,
        tutorialId: null,
        status: 'completed',
        attempts: 1,
      },
    ]);
  });

  it('evaluates a failing submission, records the lab as in progress and keeps counting attempts', async () => {
    const labId = await insertLab({ allowedAttempts: 3 });

    const response = await submit(learnerAgent, labId, incorrectAnswers).expect(
      200,
    );
    const result = response.body as LabSubmissionResult;

    expect(result).toEqual({
      labId,
      passed: false,
      message: expect.any(String),
      goals: [
        { goalId: 'goal-1', passed: false, reason: 'Incorrect region' },
        { goalId: 'goal-2', passed: false, reason: 'Outside tolerance' },
        { goalId: 'goal-3', passed: true },
        { goalId: 'goal-4', passed: false, reason: 'Incorrect answer' },
        { goalId: 'goal-5', passed: true },
      ],
      attemptsRemaining: 2,
    });
    expect(LAB_FAILURE_MESSAGES).toContain(result.message);
    expect(await getProgress(labId)).toEqual([
      expect.objectContaining({ status: 'in_progress', attempts: 1 }),
    ]);

    // A second failure updates the same row rather than inserting another.
    await submit(learnerAgent, labId, incorrectAnswers).expect(200);
    expect(await getProgress(labId)).toEqual([
      expect.objectContaining({ status: 'in_progress', attempts: 2 }),
    ]);
  });

  it('rejects a submission over allowedAttempts with 403 and leaves progress unchanged', async () => {
    const labId = await insertLab({ allowedAttempts: 2 });

    const first = await submit(learnerAgent, labId, incorrectAnswers).expect(
      200,
    );
    expect(first.body).toMatchObject({ passed: false, attemptsRemaining: 1 });

    const second = await submit(learnerAgent, labId, correctAnswers).expect(
      200,
    );
    expect(second.body).toMatchObject({ passed: true, attemptsRemaining: 0 });

    const rejected = await submit(learnerAgent, labId, correctAnswers).expect(
      403,
    );
    expect(rejected.body).toMatchObject({
      statusCode: 403,
      message: 'You have no attempts remaining for this lab',
    });
    // Completing the lab does not reset attempts, and a rejected submission does not use one.
    expect(await getProgress(labId)).toEqual([
      expect.objectContaining({ status: 'completed', attempts: 2 }),
    ]);
  });

  it('never exceeds allowedAttempts when submissions arrive concurrently', async () => {
    const labId = await insertLab({ allowedAttempts: 2 });

    const responses = await Promise.all(
      Array.from({ length: 4 }, () =>
        submit(learnerAgent, labId, incorrectAnswers),
      ),
    );

    expect(
      responses.map((response) => response.status).sort((a, b) => a - b),
    ).toEqual([200, 200, 403, 403]);
    expect(await getProgress(labId)).toEqual([
      expect.objectContaining({ status: 'in_progress', attempts: 2 }),
    ]);
  });

  it('lets an author submit, allows unlimited attempts and keeps a completed lab completed after a failure', async () => {
    const labId = await insertLab({ allowedAttempts: null });

    const passing = await submit(authorAgent, labId, correctAnswers).expect(
      200,
    );
    expect(passing.body).toMatchObject({
      passed: true,
      attemptsRemaining: null,
    });

    const failing = await submit(authorAgent, labId, incorrectAnswers).expect(
      200,
    );
    expect(failing.body).toMatchObject({
      passed: false,
      attemptsRemaining: null,
    });

    expect(await getProgress(labId)).toEqual([
      expect.objectContaining({
        userId: authorId,
        status: 'completed',
        attempts: 2,
      }),
    ]);
  });

  it('returns 400 for an unknown goal ID without using an attempt', async () => {
    const labId = await insertLab({ allowedAttempts: 3 });

    const response = await submit(learnerAgent, labId, {
      ...correctAnswers,
      'goal-99': 'JP',
    }).expect(400);

    expect(response.body).toMatchObject({
      message: 'Unknown goal ID(s): goal-99',
    });
    expect(await getProgress(labId)).toEqual([]);
  });

  it('returns 400 for answers in the wrong format without using an attempt', async () => {
    const labId = await insertLab({ allowedAttempts: 3 });

    await learnerAgent
      .post(`/labs/${labId}/submit`)
      .send({ answers: 'JP' })
      .expect(400);
    await learnerAgent.post(`/labs/${labId}/submit`).send({}).expect(400);
    await submit(learnerAgent, labId, {
      ...correctAnswers,
      'goal-5': 'India',
    }).expect(400);
    await submit(learnerAgent, labId, {
      ...correctAnswers,
      // An unclosed ring.
      'goal-3': [
        [
          [79.7, 9.8],
          [81.9, 7.5],
          [80.6, 5.9],
        ],
      ],
    }).expect(400);

    expect(await getProgress(labId)).toEqual([]);
  });

  it('does not return `expected` or the answers in the response', async () => {
    const labId = await insertLab({ allowedAttempts: 3 });

    const response = await submit(learnerAgent, labId, {
      'goal-1': 'CN',
    }).expect(200);

    expect(response.text).not.toContain('expected');
    expect(response.text).not.toContain('Seoul');
    expect(response.text).not.toContain('"JP"');
  });

  it('returns 404 for an unpublished lab', async () => {
    const labId = await insertLab({ allowedAttempts: 3, isPublished: false });

    await submit(learnerAgent, labId, correctAnswers).expect(404);
    expect(await getProgress(labId)).toEqual([]);
  });

  it('returns 404 for a valid UUID that does not exist', async () => {
    await submit(learnerAgent, randomUUID(), correctAnswers).expect(404);
  });

  it('returns 400 for a malformed UUID', async () => {
    await submit(learnerAgent, 'not-a-uuid', correctAnswers).expect(400);
  });
});
