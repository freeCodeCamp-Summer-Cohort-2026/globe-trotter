import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@repo/database";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { passwordSchema } from "@repo/types";
import type { EmailService } from "../email/email.service";
import { Logger } from "@nestjs/common";

export type Auth = ReturnType<typeof createAuth>;

//? Using a factory function so that the email service can be injected as a parameter rather than imported
export function createAuth(emailService: EmailService) {
  const nodeEnv = process.env.NODE_ENV;
  const emailProvider = process.env.EMAIL_PROVIDER;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const googleProvider =
    clientId && clientSecret ? { clientId, clientSecret } : undefined;

  if (nodeEnv !== "test" && emailProvider === "stub") {
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
    throw new Error("BETTER_AUTH_URL environment variable is required.");
  }

  const webURL = process.env.WEB_URL;
  if (!webURL || typeof webURL !== "string") {
    throw new Error("WEB_URL environment variable is required.");
  }

  const logger = new Logger("Auth");

  return betterAuth({
    /* Custom middleware hook needed because Better Auth bypasses the regular NestJS validation pipeline */
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/sign-up/email" && ctx.path !== "/reset-password") return;

        //? Reset password sends the new password as "newPassword" rather than "password"
        const password = ctx.path === "/reset-password" ? ctx.body?.newPassword : ctx.body?.password;
        if (typeof password !== "string") return;

        const result = passwordSchema.safeParse(password);
        if (!result.success) {
          const msg = result.error.issues[0]?.message ?? "Invalid password";
          throw new APIError("BAD_REQUEST", { message: msg });
        }
      }),
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      autoSignIn: false,
      onExistingUserSignUp: async ({ user }) => {
        //? Do not await - this is to prevent timing attacks
        void emailService.sendDuplicateSignUpNotice(user.email)
          .catch(err => logger.error('[auth] Unexpected error sending duplicate sign-up notice:', err));
      },
      resetPasswordTokenExpiresIn: 60 * 60, // 1 hour (in seconds)
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        //? Do not await - this is to prevent timing attacks
        void emailService.sendPasswordResetEmail(user.email, url)
          .catch(err => logger.error(
            `Failed to send password reset email to ${user.email}: ${err instanceof Error ? err.message : String(err)}`
          ));
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        //? Do not await - this is to prevent timing attacks
        void emailService.sendVerificationEmail(user.email, url)
          .catch(err => logger.error(
            `Failed to send verification email to ${user.email}: ${err instanceof Error ? err.message : String(err)}`
          ));
      },
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
    },
    secret,
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    advanced: {
      defaultCookieAttributes: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    },
    socialProviders: googleProvider ? { google: googleProvider } : undefined,
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: googleProvider ? ["google"] : [],
      },
    },
    user: {
      additionalFields: {
        role: { type: "string", defaultValue: "learner", input: false },
      },
    },
    // Can add app URL here once deployed
    trustedOrigins: [webURL]
  });
}