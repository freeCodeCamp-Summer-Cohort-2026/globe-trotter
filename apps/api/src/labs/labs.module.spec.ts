// Mock the ESM-only package so Jest can load the controller in CJS mode.
jest.mock('@thallesp/nestjs-better-auth', () => {
  const { SetMetadata } =
    jest.requireActual<typeof import('@nestjs/common')>('@nestjs/common');
  return {
    Roles: (roles: string[]) => SetMetadata('ROLES', roles),
    Session: () => () => undefined,
  };
});

// Keeps the real Drizzle client (and its env checks) out of unit tests.
jest.mock('@repo/database', () => ({
  eq: jest.fn((column: unknown, value: unknown) => ({ column, value })),
  sql: jest.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({
    sql: strings.join('?'),
    values,
  })),
  schema: {
    labs: { id: 'labs.id' },
    userProgress: {
      userId: 'user_progress.user_id',
      moduleId: 'user_progress.module_id',
      tutorialId: 'user_progress.tutorial_id',
      labId: 'user_progress.lab_id',
      attempts: 'user_progress.attempts',
    },
  },
}));

import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  LAB_FAILURE_MESSAGES,
  LAB_SUCCESS_MESSAGES,
  type LabAnswer,
  type LabDetail,
  type LabGoal,
} from '@repo/types';
import { DRIZZLE } from '../database/database.module';
import { LabsController } from './labs.controller';
import { LabsService } from './labs.service';

const labId = '0b6f2a1e-3c4d-4e5f-8a9b-1c2d3e4f5a6b';
const moduleId = '7e8f9a0b-1c2d-4e3f-9a4b-5c6d7e8f9a0b';

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

const labRecord = {
  id: labId,
  moduleId,
  title: 'Countries of Asia',
  description: 'Find your way around Asia.',
  goals,
  allowedAttempts: 3,
  orderIndex: 1,
  isPublished: true,
  createdAt: new Date('2026-01-01T12:00:00.000Z'),
  updatedAt: new Date('2026-01-02T12:00:00.000Z'),
};

const labDetail: LabDetail = {
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
  updatedAt: '2026-01-02T12:00:00.000Z',
};

const userId = 'user-1';

const correctAnswers: Record<string, LabAnswer> = {
  'goal-1': 'jp',
  'goal-2': [
    [91.1, 33.4],
    [121.9, 31.4],
  ],
  'goal-3': [
    [
      [79.7, 9.8],
      [81.9, 7.5],
      [80.6, 5.9],
      [79.7, 9.8],
    ],
  ],
  'goal-4': ' seoul ',
  'goal-5': 1,
};

// Upsert target and attempt increment shared by every recorded submission.
const progressTarget = [
  'user_progress.user_id',
  'user_progress.module_id',
  'user_progress.tutorial_id',
  'user_progress.lab_id',
];
const incrementAttempts = { sql: '? + 1', values: ['user_progress.attempts'] };
const touchUpdatedAt = { sql: 'now()', values: [] };

describe('LabsModule', () => {
  let labsController: LabsController;
  let labsService: LabsService;
  const findFirst = jest.fn();
  // Drizzle insert chain: insert().values().onConflictDoUpdate().returning()
  const returning = jest.fn();
  const onConflictDoUpdate = jest.fn(() => ({ returning }));
  const values = jest.fn(() => ({ onConflictDoUpdate }));
  const insert = jest.fn(() => ({ values }));

  beforeEach(async () => {
    findFirst.mockReset();
    returning.mockReset();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabsController],
      providers: [
        LabsService,
        {
          provide: DRIZZLE,
          useValue: { query: { labs: { findFirst } }, insert },
        },
      ],
    }).compile();

    labsController = module.get(LabsController);
    labsService = module.get(LabsService);
  });

  describe('LabsService', () => {
    it('returns the lab detail for an existing lab', async () => {
      findFirst.mockResolvedValue(labRecord);

      await expect(labsService.getLab(labId)).resolves.toEqual(labDetail);
      expect(findFirst).toHaveBeenCalledWith({
        where: { column: 'labs.id', value: labId },
      });
    });

    it('throws NotFoundException when the lab does not exist', async () => {
      findFirst.mockResolvedValue(undefined);

      await expect(labsService.getLab(labId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when the lab is not published', async () => {
      findFirst.mockResolvedValue({ ...labRecord, isPublished: false });

      await expect(labsService.getLab(labId)).rejects.toThrow(
        NotFoundException,
      );
    });

    // Security regression guard: `expected` is the answer key for each goal.
    it('never returns `expected` on any goal', async () => {
      findFirst.mockResolvedValue(labRecord);

      const lab = await labsService.getLab(labId);

      expect(lab.goals).toHaveLength(goals.length);
      for (const goal of lab.goals) {
        expect(goal).not.toHaveProperty('expected');
        expect(['id', 'type', 'description', 'hint', 'options']).toEqual(
          expect.arrayContaining(Object.keys(goal)),
        );
      }
      expect(JSON.stringify(lab)).not.toContain('"expected"');
    });
  });

  describe('LabsService.submitLab', () => {
    it('returns per-goal results, a success message and the attempts remaining for a passing submission', async () => {
      findFirst.mockResolvedValue(labRecord);
      returning.mockResolvedValue([{ attempts: 1 }]);

      const result = await labsService.submitLab(labId, userId, correctAnswers);

      expect(result).toEqual({
        labId,
        passed: true,
        message: expect.any(String),
        goals: goals.map((goal) => ({ goalId: goal.id, passed: true })),
        attemptsRemaining: 2,
      });
      expect(LAB_SUCCESS_MESSAGES).toContain(result.message);
    });

    it('updates user_progress to completed on a passing submission', async () => {
      findFirst.mockResolvedValue(labRecord);
      returning.mockResolvedValue([{ attempts: 1 }]);

      await labsService.submitLab(labId, userId, correctAnswers);

      expect(values).toHaveBeenCalledWith({
        userId,
        moduleId,
        labId,
        status: 'completed',
        attempts: 1,
      });
      expect(onConflictDoUpdate).toHaveBeenCalledWith({
        target: progressTarget,
        set: {
          attempts: incrementAttempts,
          updatedAt: touchUpdatedAt,
          status: 'completed',
        },
        setWhere: { sql: '? < ?', values: ['user_progress.attempts', 3] },
      });
    });

    it('increments attempts but leaves the status unchanged on a failing submission', async () => {
      findFirst.mockResolvedValue(labRecord);
      returning.mockResolvedValue([{ attempts: 2 }]);

      const result = await labsService.submitLab(labId, userId, {
        ...correctAnswers,
        'goal-5': 0,
      });

      expect(result).toEqual({
        labId,
        passed: false,
        message: expect.any(String),
        goals: [
          { goalId: 'goal-1', passed: true },
          { goalId: 'goal-2', passed: true },
          { goalId: 'goal-3', passed: true },
          { goalId: 'goal-4', passed: true },
          { goalId: 'goal-5', passed: false, reason: 'Incorrect option' },
        ],
        attemptsRemaining: 1,
      });
      expect(LAB_FAILURE_MESSAGES).toContain(result.message);
      // A new row starts in progress; an existing row only has its attempts and updatedAt changed.
      expect(values).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'in_progress', attempts: 1 }),
      );
      expect(onConflictDoUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          set: { attempts: incrementAttempts, updatedAt: touchUpdatedAt },
        }),
      );
    });

    it('fails goals that have no answer', async () => {
      findFirst.mockResolvedValue(labRecord);
      returning.mockResolvedValue([{ attempts: 1 }]);

      const partialAnswers = Object.fromEntries(
        Object.entries(correctAnswers).filter(
          ([goalId]) => goalId !== 'goal-3',
        ),
      );
      const result = await labsService.submitLab(labId, userId, partialAnswers);

      expect(result.passed).toBe(false);
      expect(result.goals[2]).toEqual({
        goalId: 'goal-3',
        passed: false,
        reason: 'No answer submitted',
      });
    });

    it('returns null attemptsRemaining and does not limit the upsert when attempts are unlimited', async () => {
      findFirst.mockResolvedValue({ ...labRecord, allowedAttempts: null });
      returning.mockResolvedValue([{ attempts: 7 }]);

      const result = await labsService.submitLab(labId, userId, correctAnswers);

      expect(result.attemptsRemaining).toBeNull();
      expect(onConflictDoUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ setWhere: undefined }),
      );
    });

    it('rejects an unknown goal ID with a 400 without using an attempt', async () => {
      findFirst.mockResolvedValue(labRecord);

      await expect(
        labsService.submitLab(labId, userId, {
          ...correctAnswers,
          'goal-99': 'JP',
        }),
      ).rejects.toThrow(new BadRequestException('Unknown goal ID(s): goal-99'));
      expect(insert).not.toHaveBeenCalled();
    });

    it('rejects an answer in the wrong format for its goal with a 400 without using an attempt', async () => {
      findFirst.mockResolvedValue(labRecord);

      await expect(
        labsService.submitLab(labId, userId, {
          ...correctAnswers,
          'goal-5': 'India',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(insert).not.toHaveBeenCalled();
    });

    it('rejects a submission that exceeds allowedAttempts with a 403', async () => {
      findFirst.mockResolvedValue(labRecord);
      // The upsert's attempt limit blocked the update, so no row is returned.
      returning.mockResolvedValue([]);

      await expect(
        labsService.submitLab(labId, userId, correctAnswers),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects every submission with a 403 when allowedAttempts is 0', async () => {
      findFirst.mockResolvedValue({ ...labRecord, allowedAttempts: 0 });

      await expect(
        labsService.submitLab(labId, userId, correctAnswers),
      ).rejects.toThrow(ForbiddenException);
      expect(insert).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the lab does not exist or is not published', async () => {
      findFirst.mockResolvedValueOnce(undefined);
      findFirst.mockResolvedValueOnce({ ...labRecord, isPublished: false });

      await expect(
        labsService.submitLab(labId, userId, correctAnswers),
      ).rejects.toThrow(NotFoundException);
      await expect(
        labsService.submitLab(labId, userId, correctAnswers),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects a submission to a lab without goals with a 400', async () => {
      findFirst.mockResolvedValue({ ...labRecord, goals: [] });

      await expect(labsService.submitLab(labId, userId, {})).rejects.toThrow(
        BadRequestException,
      );
      expect(insert).not.toHaveBeenCalled();
    });

    // Security regression guard: `expected` is the answer key for each goal.
    it('never returns `expected` in the result', async () => {
      findFirst.mockResolvedValue(labRecord);
      returning.mockResolvedValue([{ attempts: 1 }]);

      const result = await labsService.submitLab(labId, userId, {
        'goal-1': 'CN',
      });

      expect(JSON.stringify(result)).not.toContain('expected');
      expect(JSON.stringify(result)).not.toContain('Seoul');
    });
  });

  describe('LabsController', () => {
    it('returns the lab detail from LabsService', async () => {
      findFirst.mockResolvedValue(labRecord);

      await expect(labsController.getLab(labId)).resolves.toEqual(labDetail);
    });

    it('requires a session with the learner or author role', () => {
      const handler = LabsController.prototype.getLab;

      // `PUBLIC` is set by @AllowAnonymous(), which would bypass the auth guard entirely.
      expect(Reflect.getMetadata('PUBLIC', handler)).toBeUndefined();
      expect(Reflect.getMetadata('ROLES', handler)).toEqual([
        'learner',
        'author',
      ]);
    });

    it('submits the answers on behalf of the session user', async () => {
      const result = {
        labId,
        passed: true,
        message: LAB_SUCCESS_MESSAGES[0],
        goals: [],
        attemptsRemaining: 2,
      };
      const submitLab = jest
        .spyOn(labsService, 'submitLab')
        .mockResolvedValue(result);
      const session = { user: { id: userId }, session: { userId } };

      await expect(
        labsController.submitLab(labId, session as never, {
          answers: correctAnswers,
        }),
      ).resolves.toBe(result);
      expect(submitLab).toHaveBeenCalledWith(labId, userId, correctAnswers);
    });

    it('requires a session with the learner or author role to submit', () => {
      const handler = LabsController.prototype.submitLab;

      expect(Reflect.getMetadata('PUBLIC', handler)).toBeUndefined();
      expect(Reflect.getMetadata('ROLES', handler)).toEqual([
        'learner',
        'author',
      ]);
    });
  });
});
