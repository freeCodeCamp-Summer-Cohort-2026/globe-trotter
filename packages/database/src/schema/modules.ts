import { integer, pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: text('author_id').references(() => user.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});