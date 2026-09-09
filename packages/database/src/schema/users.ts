import { pgEnum, pgTable, text, timestamp, uuid, unique } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'learner',
  'author',
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
  },
  (table) => [
    unique('users_email_unique').on(table.email),
  ],
);