import { sql } from 'drizzle-orm';

import {
  check,
  index,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
  foreignKey
} from 'drizzle-orm/pg-core';

import { users } from './users';
import { modules } from './modules';
import { tutorials } from './tutorials';
import { labs } from './labs';

export const userProgressStatusEnum = pgEnum('user_progress_status', [
  'not_started',
  'in_progress',
  'completed',
  'failed',
]);

export const userProgress = pgTable(
  'user_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),

    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, {
        onDelete: 'cascade',
      }),

    tutorialId: uuid('tutorial_id').references(() => tutorials.id, {
      onDelete: 'cascade',
    }),

    labId: uuid('lab_id').references(() => labs.id, {
      onDelete: 'cascade',
    }),

    status: userProgressStatusEnum('status').notNull(),

    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
  },
  (table) => [
    unique('user_progress_unique')
      .on(
        table.userId,
        table.moduleId,
        table.tutorialId,
        table.labId,
      )
      .nullsNotDistinct(),

    check(
      'user_progress_tutorial_lab_check',
      sql`${table.tutorialId} IS NULL OR ${table.labId} IS NULL`,
    ),

    // Check to enforce that user progress only tracks labs and tutorials - modules' progress can be determined by orderIndex/totalLessons for e.g.
    check(
      'user_progress_tutorial_or_lab_check',
      sql`${table.tutorialId} IS NOT NULL OR ${table.labId} IS NOT NULL`,
    ),

    // Composite FKs enforce that tutorial/lab belongs to their respective module (e.g. when hitting POST /user-progress)
    foreignKey({
      columns: [table.tutorialId, table.moduleId],
      foreignColumns: [tutorials.id, tutorials.moduleId],
      name: 'user_progress_tutorial_module_fk',
    }),
    foreignKey({
      columns: [table.labId, table.moduleId],
      foreignColumns: [labs.id, labs.moduleId],
      name: 'user_progress_lab_module_fk',
    }),

    index('user_progress_user_id_idx').on(table.userId),
    index('user_progress_module_id_idx').on(table.moduleId),
    index('user_progress_tutorial_id_idx').on(table.tutorialId),
    index('user_progress_lab_id_idx').on(table.labId),
  ],
);