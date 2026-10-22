import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DRIZZLE } from '../database/database.module';
import { TutorialsService } from './tutorials.service';

jest.mock('@repo/database', () => ({
  eq: jest.fn(),
  tutorials: { id: 'id' },
}));

jest.mock('../database/database.module', () => ({
  DRIZZLE: 'DRIZZLE',
}));

describe('TutorialsService', () => {
  let tutorialsService: TutorialsService;
  const findFirst = jest.fn();

  beforeEach(async () => {
    findFirst.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorialsService,
        {
          provide: DRIZZLE,
          useValue: { query: { tutorials: { findFirst } } },
        },
      ],
    })
      .compile();

    tutorialsService = module.get(TutorialsService);
  });

  it('returns a tutorial with parsed TipTap content', async () => {
    const tutorial = {
      id: 'd06c5198-7d01-4d14-a2f9-88f5319529ed',
      moduleId: '5d20c096-f5df-4c36-ae3e-b8a6e32a6e28',
      title: 'Introduction to Europe',
      description: null,
      content: '{"type":"doc","content":[]}',
      estimatedDuration: 15,
      orderIndex: 1,
      isPublished: true,
      createdAt: new Date('2026-01-01T12:00:00.000Z'),
      updatedAt: new Date('2026-01-02T12:00:00.000Z'),
    };
    findFirst.mockResolvedValue(tutorial);

    await expect(tutorialsService.getTutorial(tutorial.id)).resolves.toEqual({
      ...tutorial,
      content: { type: 'doc', content: [] },
      createdAt: '2026-01-01T12:00:00.000Z',
      updatedAt: '2026-01-02T12:00:00.000Z',
    });
  });

  it('throws when the tutorial does not exist', async () => {
    findFirst.mockResolvedValue(undefined);

    await expect(
      tutorialsService.getTutorial('d06c5198-7d01-4d14-a2f9-88f5319529ed'),
    ).rejects.toThrow(NotFoundException);
  });
});
