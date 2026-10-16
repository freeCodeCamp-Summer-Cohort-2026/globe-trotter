import { jest, describe, it, expect } from "@jest/globals";

process.env.BETTER_AUTH_SECRET = "test-secret-for-unit-tests-only";
process.env.BETTER_AUTH_URL = "http://localhost:4000";
process.env.WEB_URL = "http://localhost:3000";

jest.mock("@repo/database", () => ({
  db: { __mock: true },
}));

jest.mock("@better-auth/drizzle-adapter", () => ({
  drizzleAdapter: jest.fn(() => ({ __adapterMock: true })),
}));

jest.mock("better-auth/minimal", () => ({
  betterAuth: jest.fn((config) => ({ config })),
}));

import { betterAuth } from "better-auth/minimal";
import { auth } from "./auth";

describe("Better Auth configuration", () => {
  const getConfig = () =>
    (auth as unknown as { config: Record<string, any> }).config;

  it("configures a seven-day session expiry", () => {
    expect(getConfig().session.expiresIn).toBe(7 * 24 * 60 * 60);
  });

  it("configures session update age to one day", () => {
    expect(getConfig().session.updateAge).toBe(24 * 60 * 60);
  });

  it("configures secure cookie attributes", () => {
    expect(getConfig().advanced.defaultCookieAttributes).toEqual({
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  });

  it("initializes Better Auth with the configuration", () => {
    expect(betterAuth).toHaveBeenCalled();
  });
});
