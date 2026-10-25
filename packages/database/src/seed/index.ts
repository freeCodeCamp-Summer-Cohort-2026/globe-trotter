import "dotenv/config";
import { eq, inArray } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

import { db, closeDatabase } from "../client";
import * as schema from "../schema";

import { seedUsers, SEED_PASSWORD_PLAIN, SEED_USERS } from "./users";
import {
  seedModules,
  seedTutorials,
  seedLabs,
  SEED_MODULES,
} from "./content/index";
import { seedProgress } from "./progress";

async function seed() {
  console.log("Starting seed...");

  const passwordHash = await hashPassword(SEED_PASSWORD_PLAIN);

  const knownUserIds = Object.values(SEED_USERS).map((u) => u.id);
  const knownModuleIds = Object.values(SEED_MODULES).map((m) => m.id);

  await db.transaction(async (tx) => {
    // ── Delete existing seed data
    await tx
      .delete(schema.userProgress)
      .where(inArray(schema.userProgress.userId, knownUserIds));

    await tx
      .delete(schema.tutorials)
      .where(inArray(schema.tutorials.moduleId, knownModuleIds));

    await tx
      .delete(schema.labs)
      .where(inArray(schema.labs.moduleId, knownModuleIds));

    await tx
      .delete(schema.modules)
      .where(inArray(schema.modules.id, knownModuleIds));

    await tx
      .delete(schema.account)
      .where(inArray(schema.user.id, knownUserIds));

    // ── Insert users
    await tx.insert(schema.user).values(
      seedUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: u.emailVerified,
        role: u.role,
        createAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    // Insert credential accounts
    await tx.insert(schema.account).values(
      seedUsers.map((u) => ({
        id: crypto.randomUUID(),
        accountId: u.email,
        providerId: "credential",
        userId: u.id,
        password: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    // Insert modules
    await tx.insert(schema.modules).values(
      seedModules.map((m) => ({
        id: m.id,
        title: m.title,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    // Insert tutorials
    await tx.insert(schema.tutorials).values(
      seedTutorials.map((t) => ({
        id: t.id,
        moduleId: t.moduleId,
        title: t.title,
        content: t.content,
        orderIndex: t.orderIndex,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    // Insert Labs
    await tx.insert(schema.labs).values(
      seedLabs.map((l) => ({
        id: l.id,
        moduleId: l.moduleId,
        title: l.title,
        orderIndex: l.orderIndex,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    // Insert user progress
    await tx.insert(schema.userProgress).values(
      seedProgress.map((p) => ({
        userId: p.userId,
        moduleId: p.moduleId,
        tutorialId: p.tutorialId ?? undefined,
        labId: p.labId ?? undefined,
        status: p.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    console.log("Seeding Completed");
  });
}

seed()
  .catch((error) => {
    console.log("Seed failed: ", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
