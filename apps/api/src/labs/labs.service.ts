import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Db } from '@repo/database';
import { eq, schema, sql } from '@repo/database';
import {
  LAB_FAILURE_MESSAGES,
  LAB_SUCCESS_MESSAGES,
  type LabAnswer,
  type LabDetail,
  type LabGoal,
  type LabGoalPublic,
  type LabSubmissionResult,
} from '@repo/types';
import { DRIZZLE } from '../database/database.module';
import { evaluateGoal, getAnswerError } from './lab-evaluation';

type Lab = typeof schema.labs.$inferSelect;

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

function pickRandomMessage(messages: readonly [string, ...string[]]): string {
  return messages[Math.floor(Math.random() * messages.length)] ?? messages[0];
}

const NO_ATTEMPTS_REMAINING = 'You have no attempts remaining for this lab';

@Injectable()
export class LabsService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  async getLab(id: string): Promise<LabDetail> {
    const lab = await this.findPublishedLab(id);

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

  async submitLab(
    labId: string,
    userId: string,
    answers: Record<string, LabAnswer>,
  ): Promise<LabSubmissionResult> {
    const lab = await this.findPublishedLab(labId);
    const goals = Array.isArray(lab.goals) ? (lab.goals as LabGoal[]) : [];

    if (goals.length === 0) {
      throw new BadRequestException(`Lab ${labId} has no goals to evaluate`);
    }

    // A Map keeps inherited Object properties (e.g. `toString`) from being read as answers.
    const submitted = new Map(Object.entries(answers));
    const goalIds = new Set(goals.map((goal) => goal.id));
    const unknownGoalIds = [...submitted.keys()].filter(
      (goalId) => !goalIds.has(goalId),
    );

    if (unknownGoalIds.length > 0) {
      throw new BadRequestException(
        `Unknown goal ID(s): ${unknownGoalIds.join(', ')}`,
      );
    }

    // Malformed answers are rejected before an attempt is used.
    const answerErrors = goals.flatMap((goal) => {
      const answer = submitted.get(goal.id);
      const error = answer === undefined ? null : getAnswerError(goal, answer);
      return error === null ? [] : [error];
    });

    if (answerErrors.length > 0) {
      throw new BadRequestException(answerErrors);
    }

    const results = goals.map((goal) =>
      evaluateGoal(goal, submitted.get(goal.id)),
    );
    const passed = results.every((result) => result.passed);
    const attempts = await this.recordAttempt(lab, userId, passed);

    return {
      labId: lab.id,
      passed,
      message: pickRandomMessage(
        passed ? LAB_SUCCESS_MESSAGES : LAB_FAILURE_MESSAGES,
      ),
      goals: results,
      attemptsRemaining:
        lab.allowedAttempts === null ? null : lab.allowedAttempts - attempts,
    };
  }

  private async findPublishedLab(id: string): Promise<Lab> {
    const lab = await this.db.query.labs.findFirst({
      where: eq(schema.labs.id, id),
    });

    // Unpublished labs are drafts, so they are reported as not found rather than revealing that they exist.
    if (!lab || !lab.isPublished) {
      throw new NotFoundException(`Lab ${id} not found`);
    }

    return lab;
  }

  /**
   * Increments the user's attempt count for the lab and updates their progress in a single upsert, so
   * concurrent submissions cannot exceed `allowedAttempts`. Returns the new attempt count.
   */
  private async recordAttempt(
    lab: Lab,
    userId: string,
    passed: boolean,
  ): Promise<number> {
    const { allowedAttempts } = lab;
    const { userProgress } = schema;

    // A new progress row starts at 1 attempt, so a limit below 1 is checked here rather than in the upsert.
    if (allowedAttempts !== null && allowedAttempts < 1) {
      throw new ForbiddenException(NO_ATTEMPTS_REMAINING);
    }

    const [progress] = await this.db
      .insert(userProgress)
      .values({
        userId,
        moduleId: lab.moduleId,
        labId: lab.id,
        status: passed ? 'completed' : 'in_progress',
        attempts: 1,
      })
      .onConflictDoUpdate({
        // Matches the `user_progress_unique` constraint, which treats the null tutorial_id as equal (NULLS NOT DISTINCT).
        target: [
          userProgress.userId,
          userProgress.moduleId,
          userProgress.tutorialId,
          userProgress.labId,
        ],
        set: {
          attempts: sql`${userProgress.attempts} + 1`,
          updatedAt: sql`now()`,
          // A failed attempt leaves an existing status unchanged, so a completed lab stays completed.
          ...(passed && { status: 'completed' as const }),
        },
        // When no attempts remain the row is not updated, so nothing is returned.
        setWhere:
          allowedAttempts === null
            ? undefined
            : sql`${userProgress.attempts} < ${allowedAttempts}`,
      })
      .returning({ attempts: userProgress.attempts });

    if (!progress) {
      throw new ForbiddenException(NO_ATTEMPTS_REMAINING);
    }

    return progress.attempts;
  }
}
