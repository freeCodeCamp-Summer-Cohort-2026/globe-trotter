
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { EmailService } from "../email/email.service";

const REQUIRED_KEYS = [
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "DATABASE_URL",
  "TEST_DATABASE_URL",
  "WEB_URL",
] as const;

const GOOGLE_KEYS = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] as const;

const originalEnv = new Map<string, string | undefined>();

const mockEmailService = {
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendDuplicateSignUpNotice: jest.fn(),
} as unknown as EmailService;

async function loadAuth() {
  jest.resetModules();

  jest.unstable_mockModule("better-auth/minimal", () => ({
    betterAuth: jest.fn((options: unknown) => ({ options })),
  }));

  jest.unstable_mockModule("@repo/database", () => ({ db: {} }));

  jest.unstable_mockModule("@better-auth/drizzle-adapter", () => ({
    drizzleAdapter: jest.fn(() => ({})),
  }));

  jest.unstable_mockModule("better-auth/api", () => ({
    APIError: class APIError extends Error {
      constructor(
        public code: string,
        public options?: { message?: string },
      ) {
        super(options?.message ?? code);
      }
    },
    createAuthMiddleware: (middleware: unknown) => middleware,
  }));

  return import("./auth");
}

describe("Better Auth configuration", () => {
  beforeEach(() => {
    for (const key of [...REQUIRED_KEYS, ...GOOGLE_KEYS, "NODE_ENV", "EMAIL_PROVIDER"]) {
      originalEnv.set(key, process.env[key]);
    }

    process.env.NODE_ENV = "test";
    process.env.EMAIL_PROVIDER = "stub";
    process.env.BETTER_AUTH_SECRET = "test-secret";
    process.env.BETTER_AUTH_URL = "http://localhost:4000";
    process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";
    process.env.TEST_DATABASE_URL = "postgres://test:test@localhost:5432/test";
    process.env.WEB_URL = "http://localhost:3000";
  });

  afterEach(() => {
    for (const [key, value] of originalEnv) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }

    originalEnv.clear();
    jest.clearAllMocks();
  });

  it("configures a seven-day session expiry", async () => {
    const { createAuth } = await loadAuth();
    const auth = createAuth(mockEmailService);

    expect(auth.options.session?.expiresIn).toBe(7 * 24 * 60 * 60);
  });

  it("configures session update age to one day", async () => {
    const { createAuth } = await loadAuth();
    const auth = createAuth(mockEmailService);

    expect(auth.options.session?.updateAge).toBe(24 * 60 * 60);
  });

  it("configures HTTP-only, same-site cookies", async () => {
    const { createAuth } = await loadAuth();
    const auth = createAuth(mockEmailService);

    expect(auth.options.advanced?.defaultCookieAttributes).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
  });

  it("enables secure cookies in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.EMAIL_PROVIDER = "resend";

    const { createAuth } = await loadAuth();
    const auth = createAuth(mockEmailService);

    expect(
      auth.options.advanced?.defaultCookieAttributes?.secure,
    ).toBe(true);
  });

  it("registers Google and trusts it for account linking when credentials are present", async () => {
    process.env.GOOGLE_CLIENT_ID = "__test_google_client_id__";
    process.env.GOOGLE_CLIENT_SECRET = "__test_google_client_secret__";

    const { createAuth } = await loadAuth();
    const auth = createAuth(mockEmailService);

    expect(auth.options.socialProviders?.google).toEqual({
      clientId: "__test_google_client_id__",
      clientSecret: "__test_google_client_secret__",
    });

    expect(auth.options.account?.accountLinking).toEqual({
      enabled: true,
      trustedProviders: ["google"],
    });

    expect(auth.options.trustedOrigins).toEqual(["http://localhost:3000"]);
  });

  it("boots without Google OAuth when credentials are absent", async () => {
    const { createAuth } = await loadAuth();
    const auth = createAuth(mockEmailService);

    expect(auth.options.socialProviders).toBeUndefined();
    expect(auth.options.account?.accountLinking).toEqual({
      enabled: true,
      trustedProviders: [],
    });
  });

  it("boots without Google OAuth when only one credential is present", async () => {
    process.env.GOOGLE_CLIENT_ID = "__test_google_client_id__";

    const { createAuth } = await loadAuth();
    const auth = createAuth(mockEmailService);

    expect(auth.options.socialProviders).toBeUndefined();
  });

  it("throws when BETTER_AUTH_SECRET is missing", async () => {
    process.env.BETTER_AUTH_SECRET = "";

    const { createAuth } = await loadAuth();

    expect(() => createAuth(mockEmailService)).toThrow(
      "BETTER_AUTH_SECRET",
    );
  });
});
