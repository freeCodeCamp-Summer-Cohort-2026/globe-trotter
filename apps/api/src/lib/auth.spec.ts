import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

const REQUIRED_KEYS = [
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'DATABASE_URL',
] as const;
const GOOGLE_KEYS = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] as const;

async function loadAuth() {
  jest.resetModules();
  jest.unstable_mockModule('better-auth/minimal', () => ({
    betterAuth: jest.fn((options: unknown) => ({ options })),
  }));
  jest.unstable_mockModule('@repo/database', () => ({ db: {} }));
  jest.unstable_mockModule('@better-auth/drizzle-adapter', () => ({
    drizzleAdapter: jest.fn(() => ({})),
  }));
  return import('./auth');
}

describe('Better Auth social sign-in configuration', () => {
  beforeEach(() => {
    process.env.BETTER_AUTH_SECRET = 'test-secret';
    process.env.BETTER_AUTH_URL = 'http://localhost:3000';
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
  });

  afterEach(() => {
    for (const key of [...REQUIRED_KEYS, ...GOOGLE_KEYS]) {
      delete process.env[key];
    }
  });

  it('registers Google and trusts it for account linking when credentials are present', async () => {
    process.env.GOOGLE_CLIENT_ID = '__test_google_client_id__';
    process.env.GOOGLE_CLIENT_SECRET = '__test_google_client_secret__';

    const { createAuth } = await loadAuth();
    const auth = createAuth();

    expect(auth.options.socialProviders?.google).toEqual({
      clientId: '__test_google_client_id__',
      clientSecret: '__test_google_client_secret__',
    });
    expect(auth.options.account?.accountLinking).toEqual({
      enabled: true,
      trustedProviders: ['google'],
    });
    expect(auth.options.trustedOrigins).toEqual(['http://localhost:3000']);
  });

  it('boots without Google OAuth when credentials are absent', async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;

    const { createAuth } = await loadAuth();
    const auth = createAuth();

    expect(auth.options.socialProviders).toBeUndefined();
    expect(auth.options.account?.accountLinking).toEqual({
      enabled: true,
      trustedProviders: [],
    });
  });

  it('boots without Google OAuth when only one credential is present', async () => {
    process.env.GOOGLE_CLIENT_ID = '__test_google_client_id__';
    delete process.env.GOOGLE_CLIENT_SECRET;

    const { createAuth } = await loadAuth();
    const auth = createAuth();

    expect(auth.options.socialProviders).toBeUndefined();
  });

  it('throws when BETTER_AUTH_SECRET is missing', async () => {
    const { createAuth } = await loadAuth();
    delete process.env.BETTER_AUTH_SECRET;

    expect(() => createAuth()).toThrow('BETTER_AUTH_SECRET');
  });
});
