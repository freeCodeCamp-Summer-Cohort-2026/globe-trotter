import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { db } from '@repo/database';

export function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET environment variable is required. The value can be generated using the bash cmd 'openssl rand -base64 32'.",
    );
  }

  const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleProvider =
    clientId && clientSecret ? { clientId, clientSecret } : undefined;

  return betterAuth({
    secret,
    baseURL,
    database: drizzleAdapter(db, {
      provider: 'pg',
    }),
    socialProviders: googleProvider ? { google: googleProvider } : undefined,
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: googleProvider ? ['google'] : [],
      },
    },
    user: {
      additionalFields: {
        role: { type: 'string', defaultValue: 'learner', input: false },
      },
    },
    trustedOrigins: [baseURL],
  });
}
