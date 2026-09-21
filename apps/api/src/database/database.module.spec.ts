jest.mock("@repo/database", () => ({
  db: { __mock: true },
  closeDatabase: jest.fn(),
}));

import { Test } from "@nestjs/testing";
import { DatabaseModule, DRIZZLE } from "./database.module";

//* Unit test for DatabaseModule

// Idk types suck :D

describe("DatabaseModule", () => {
  it("provides the DRIZZLE token", async () => {
    const module = await Test.createTestingModule({
      imports: [DatabaseModule]
    }).compile();

    const db = module.get(DRIZZLE);
    expect(db).toBeDefined();
    expect(db).toEqual({ __mock: true });
  });
});
