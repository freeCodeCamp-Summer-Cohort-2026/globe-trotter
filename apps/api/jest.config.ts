import { nestConfig } from '@repo/jest-config'

export default {
  ...nestConfig,
  setupFiles: ["<rootDir>/../test/setup-env.ts"],
};
