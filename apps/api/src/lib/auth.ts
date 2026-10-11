import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@repo/database";

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required. The value can be generated using the bash cmd 'openssl rand -base64 32'.");
};

const url = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
if (!url) {
  throw new Error("BETTER_AUTH_URL environment variable is required. The value can be generated using the bash cmd 'openssl rand -base64 32'.");
};

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    minPasswordLength: 8,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // For now this is just a stub. When implemented, do not await sending the email to prevent timing attacks.
      console.log(`[auth] Verification email for ${user.email}: ${url}`);
      console.log(`[auth] Token: ${token}`);
    },
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  secret,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "learner", input: false },
    },
  },
  // Can add app URL here once deployed
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:4000"
  ]
});
