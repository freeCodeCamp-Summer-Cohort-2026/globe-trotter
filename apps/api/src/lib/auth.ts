import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@repo/database";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { passwordSchema } from "@repo/types";

const nodeEnv = process.env.NODE_ENV;
//TODO: Edit condition in below if statement so that it checks for non-test environment AND configured email provider
if (nodeEnv !== "test") {
  throw new APIError("INTERNAL_SERVER_ERROR", { message: "No real email provider configured in a non-test environment." });
}

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  throw new Error(
    "BETTER_AUTH_SECRET environment variable is required. The value can be generated using the bash cmd 'openssl rand -base64 32'.",
  );
}

const url = process.env.BETTER_AUTH_URL;
if (!url) {
  throw new Error('BETTER_AUTH_URL environment variable is required.');
}

const trustedOriginsInit = [
  process.env.WEB_URL
].filter(str => typeof str !== "undefined");

const trustedOrigins = trustedOriginsInit.length === 0 ? ["http://localhost:3000"] : trustedOriginsInit;

export const auth = betterAuth({
  /* Custom middleware hook needed because Better Auth bypasses the regular NestJS validation pipeline */
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email" && ctx.path !== "/reset-password") return;

      const password = ctx.body?.password;
      if (typeof password !== "string") return;

      const result = passwordSchema.safeParse(password);
      if (!result.success) {
        let msg = result.error.issues[0]?.message;
        
        if (typeof result.error.issues[0]?.message === "undefined") {
          msg = "Issue is undefined - no error message available";
        }

        throw new APIError("BAD_REQUEST", {
          message: msg,
        });
      }
    }),
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      //TODO: implement real email service before production deployment
      // For now this is just a stub. When implemented, do not await sending the email to prevent timing attacks.
      if (process.env.NODE_ENV !== "test") {
        throw new APIError('INTERNAL_SERVER_ERROR', { message: 'Email service not configured' });
      }
      console.log(`[auth] Verification email for ${user.email}: ${url}`);
      console.log(`[auth] Token: ${token}`);
    },
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  secret,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'learner', input: false },
    },
  },
  // Can add app URL here once deployed
  trustedOrigins
});
