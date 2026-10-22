import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Db } from '@repo/database';
import { eq, schema } from '@repo/database';
import type { LabDetail, LabGoal, LabGoalPublic } from '@repo/types';
import { DRIZZLE } from '../database/database.module';

// Builds the student-facing goal from an allowlist so `expected` (the answer key) is never serialised.
function toPublicGoal(goal: LabGoal): LabGoalPublic {
  return {
    id: goal.id,
    type: goal.type,
    description: goal.description,
    ...(goal.hint !== undefined && { hint: goal.hint }),
    ...(goal.type === 'multiple_choice' && { options: goal.options }),
  };
}

@Injectable()
export class LabsService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  async getLab(id: string): Promise<LabDetail> {
    const lab = await this.db.query.labs.findFirst({
      where: eq(schema.labs.id, id),
    });

    if (!lab) {
      throw new NotFoundException(`Lab ${id} not found`);
    }

    return {
      id: lab.id,
      moduleId: lab.moduleId,
      title: lab.title,
      description: lab.description,
      goals: (lab.goals as LabGoal[]).map(toPublicGoal),
      allowedAttempts: lab.allowedAttempts,
      orderIndex: lab.orderIndex,
      isPublished: lab.isPublished,
      createdAt: lab.createdAt.toISOString(),
      updatedAt: lab.updatedAt.toISOString(),
    };
  }
}
