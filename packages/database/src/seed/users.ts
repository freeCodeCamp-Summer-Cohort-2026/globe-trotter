import type { SeedUser } from "./types";

export const SEED_USERS = {
  learner: {
    id: "00000000-0000-0000-0000-000000000001",
    email: "learner@globe-trotter.dev",
  },
  author: {
    id: "00000000-0000-0000-0000-000000000002",
    email: "author@globe-trotter.dev",
  },
  newlearner: {
    id: "00000000-0000-0000-0000-000000000003",
    email: "newlearner@globe-trotter.dev",
  },
} as const;

export const SEED_PASSWORD_PLAIN = "Demo1234";

export const seedUsers: SeedUser[] = [
  {
    id: SEED_USERS.learner.id,
    name: "Demo Learner",
    email: SEED_USERS.learner.email,
    emailVerified: true,
    role: 'learner'
  },
  {
    id: SEED_USERS.author.id,
    name: "Demo Author",
    email: SEED_USERS.author.email,
    emailVerified: true,
    role: 'author'
  },
  {
    id: SEED_USERS.newlearner.id,
    name: "New Learner",
    email: SEED_USERS.newlearner.email,
    emailVerified: true,
    role: 'learner'
  }
];
