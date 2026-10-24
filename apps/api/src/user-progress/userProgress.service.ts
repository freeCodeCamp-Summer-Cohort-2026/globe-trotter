import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Db } from '@repo/database';
import { eq, and, userProgress, isNull } from '@repo/database';
import { DRIZZLE } from '../database/database.module';
import { ListUserProgressQueryDto } from './dto/list-user-progress-query.dto';
import { UpsertUserProgressDto, UserProgressRow } from './dto/upsert-user-progress.dto';

@Injectable()
export class UserProgressService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  async findAllForUser(userId: string, filters: ListUserProgressQueryDto): Promise<UserProgressRow[]> {
    const conditions = [eq(userProgress.userId, userId)];

    if (filters.moduleId) {
      conditions.push(eq(userProgress.moduleId, filters.moduleId));
    }
    if (filters.tutorialId) {
      conditions.push(eq(userProgress.tutorialId, filters.tutorialId));
    }
    if (filters.labId) {
      conditions.push(eq(userProgress.labId, filters.labId));
    }

    return this.db
      .select()
      .from(userProgress)
      .where(and(...conditions));
  }

  async upsert(userId: string, dto: UpsertUserProgressDto): Promise<UserProgressRow> {
    if (dto.tutorialId && dto.labId) {
      throw new BadRequestException("Only one of tutorialId or labId may be set");
    }

    //? Query for an existing row if I want to differentiate between 201 for insert and 200 for update
    const [existing] = await this.db
      .select({ id: userProgress.id })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.moduleId, dto.moduleId),
          dto.tutorialId ? eq(userProgress.tutorialId, dto.tutorialId) : isNull(userProgress.tutorialId),
          dto.labId ? eq(userProgress.labId, dto.labId) : isNull(userProgress.labId)
        )
      );
    
    if (existing) {
      // Update logic --> PATCH
    }

    const values = {
      userId,
      moduleId: dto.moduleId,
      tutorialId: dto.tutorialId ?? null,
      labId: dto.labId ?? null,
      status: dto.status
    }

    const [row] = await this.db
      .insert(userProgress)
      .values(values)
      .onConflictDoUpdate({
        target: [
          userProgress.userId,
          userProgress.moduleId,
          userProgress.tutorialId,
          userProgress.labId,
        ],
        set: { status: dto.status, updatedAt: new Date() }
      })
      .returning();
    
    if (typeof row === "undefined") {
      throw new Error("Failed to insert user progress row into DB");
    }
    
    return row;
  }
}
