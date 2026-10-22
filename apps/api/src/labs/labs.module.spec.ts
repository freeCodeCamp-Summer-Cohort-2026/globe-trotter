// Mock the ESM-only package so Jest can load the controller in CJS mode.
jest.mock('@thallesp/nestjs-better-auth', () => {
  const { SetMetadata } =
    jest.requireActual<typeof import('@nestjs/common')>('@nestjs/common');
  return {
    AllowAnonymous: () => SetMetadata('PUBLIC', true),
    Roles: (roles: string[]) => SetMetadata('ROLES', roles),
  };
});

// Keeps the real Drizzle client (and its env checks) out of unit tests.
jest.mock('@repo/database', () => ({
  eq: jest.fn((column: unknown, value: unknown) => ({ column, value })),
  schema: { labs: { id: 'labs.id' } },
}));

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { LabDetail, LabGoal } from '@repo/types';
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

describe('LabsModule', () => {
  let labsController: LabsController;
  let labsService: LabsService;
  const findFirst = jest.fn();

  beforeEach(async () => {
    findFirst.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabsController],
      providers: [
        LabsService,
        {
          provide: DRIZZLE,
          useValue: { query: { labs: { findFirst } } },
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

  describe('LabsController', () => {
    it('returns the lab detail from LabsService', async () => {
      findFirst.mockResolvedValue(labRecord);

      await expect(labsController.getLab(labId)).resolves.toEqual(labDetail);
    });

    it('allows anonymous access and both learner and author roles', () => {
      const handler = LabsController.prototype.getLab;

      expect(Reflect.getMetadata('PUBLIC', handler)).toBe(true);
      expect(Reflect.getMetadata('ROLES', handler)).toEqual([
        'learner',
        'author',
      ]);
    });
  });
});
