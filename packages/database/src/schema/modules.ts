import { integer, pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const modules = pgTable('modules', {
  id: uuid('id').primaryKey(),
  authorId: uuid('author_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  orderIndex: integer('order_index').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  isPublished: boolean('is_published').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});