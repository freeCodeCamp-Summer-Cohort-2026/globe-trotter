import { sql } from "drizzle-orm";
import { db, closeDatabase } from "../client";

describe("Database client", () => {
  afterAll(async () => {
    await closeDatabase();
  });

  it("should connect to PostgreSQL and execute SELECT 1", async () => {
    const result = await db.execute(sql`SELECT 1`);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toEqual({ "?column?": 1 });
  });
});