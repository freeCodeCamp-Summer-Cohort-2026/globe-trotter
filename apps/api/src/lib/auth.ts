import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@repo/database";

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required. The value can be generated using the bash cmd 'openssl rand -base64 32'.");
};

const url = process.env.BETTER_AUTH_URL;
if (!url) {
  throw new Error("BETTER_AUTH_URL environment variable is required.");
}

const webURL = process.env.WEB_URL;
if (!webURL) {
  throw new Error("WEB_URL environment variable is required.");
}

export const auth = betterAuth({
  secret,
  baseURL: url,

  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh after 1 day
  },

  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
  },

  emailVerification: {
    sendOnSignUp: true,
  },

  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "learner", input: false },
    },
  },

  trustedOrigins: [webURL],
});
