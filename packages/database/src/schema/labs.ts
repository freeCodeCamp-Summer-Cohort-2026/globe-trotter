import {
  integer,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { modules } from './modules';

export const labs = pgTable(
  'labs',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, {
        onDelete: 'cascade',
      }),

    title: text('title').notNull(),
    description: text('description').notNull(),
    content: text('content').notNull(),
    orderIndex: integer('order_index').notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
  },
  (table) => [
    unique('labs_module_order_unique').on(
      table.moduleId,
      table.orderIndex,
    ),
    index('labs_module_order_idx').on(
      table.moduleId,
      table.orderIndex,
    ),
  ],
);