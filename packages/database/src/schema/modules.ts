import { integer, pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: text('author_id').references(() => user.id, {
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