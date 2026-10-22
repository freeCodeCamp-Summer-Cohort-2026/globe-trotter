import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Db } from '@repo/database';
import { eq, tutorials } from '@repo/database';
import type { TutorialDetail } from '@repo/types';
import { DRIZZLE } from '../database/database.module';

@Injectable()
export class TutorialsService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  async getTutorial(id: string): Promise<TutorialDetail> {
    const tutorial = await this.db.query.tutorials.findFirst({
      where: eq(tutorials.id, id),
    });

    if (!tutorial) {
      throw new NotFoundException(`Tutorial ${id} not found`);
    }

    let content: unknown;
    try {
      content = JSON.parse(tutorial.content);
    } catch {
      // If the stored content is not valid JSON, return it as-is.
      // The frontend TipTap editor will handle parsing.
      content = tutorial.content;
    }

    return {
      ...tutorial,
      content,
      createdAt: tutorial.createdAt.toISOString(),
      updatedAt: tutorial.updatedAt.toISOString(),
    };
  }
}
