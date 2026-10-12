import { nestConfig } from '@repo/jest-config'

export default {
  ...nestConfig,
  setupFiles: ['reflect-metadata'],
  transformIgnorePatterns: [
    'node_modules/(?!(@thallesp/nestjs-better-auth)/)',
  ],
};
