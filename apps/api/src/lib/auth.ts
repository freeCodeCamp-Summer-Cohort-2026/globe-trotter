import { betterAuth } from "better-auth/minimal";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@repo/database";

const secret = process.env.BETTER_AUTH_SECRET;

if (!secret) {
  throw new Error(
    "BETTER_AUTH_SECRET environment variable is required. The value can be generated using the bash cmd 'openssl rand -base64 32'.",
  );
}

const url = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const loginFailures = new Map<
  string,
  { count: number; lockedUntil?: number }
>();

export const auth = betterAuth({
  secret,

  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "learner",
        input: false,
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;

      // Fetch Metadata protection.
      const fetchSite = ctx.headers?.get("sec-fetch-site");

      if (fetchSite === "cross-site") {
        throw new APIError("FORBIDDEN", {
          message: "Cross-site authentication request blocked.",
        });
      }

      const email = ctx.body?.email;

      if (typeof email !== "string") return;

      const key = email.trim().toLowerCase();
      const record = loginFailures.get(key);

      if (!record) return;

      if (record.lockedUntil && Date.now() < record.lockedUntil) {
        throw new APIError("TOO_MANY_REQUESTS", {
          message: "Account temporarily locked. Try again later.",
        });
      }

      // Lockout expired.
      if (record.lockedUntil && Date.now() >= record.lockedUntil) {
        loginFailures.delete(key);
      }
    }),

    after: createAuthMiddleware(async (ctx) => {
  if (ctx.path !== "/sign-in/email") return;

  const email = ctx.body?.email;

  if (typeof email !== "string") return;

  const key = email.trim().toLowerCase();
  const result = ctx.context.returned;

  if (!(result instanceof APIError)) {
    loginFailures.delete(key);
    return;
  }

  if (result.body?.code === "INVALID_EMAIL_OR_PASSWORD") {
    const record = loginFailures.get(key) ?? { count: 0 };

    record.count += 1;

    if (record.count >= 10) {
      record.lockedUntil = Date.now() + 15 * 60 * 1000;
    }

    loginFailures.set(key, record);
  }
}),
  },

  rateLimit: {
    enabled: true,
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5,
      },
    },
  },

  trustedOrigins: ["http://localhost:3000"],
});