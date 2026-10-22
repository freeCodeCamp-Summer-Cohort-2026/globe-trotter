import {
  boolean,
  integer,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { modules } from './modules';

export const tutorials = pgTable(
  'tutorials',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, {
        onDelete: 'cascade',
      }),

    title: text('title').notNull(),
    description: text('description'),
    content: text('content').notNull(),
    estimatedDuration: integer('estimated_duration'),
    orderIndex: integer('order_index').notNull(),
    isPublished: boolean('is_published').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    unique('tutorials_module_order_unique').on(
      table.moduleId,
      table.orderIndex,
    ),
    index('tutorials_module_order_idx').on(
      table.moduleId,
      table.orderIndex,
    ),
    unique('tutorials_id_module_unique').on(
      table.id,
      table.moduleId
    )
  ],
);
