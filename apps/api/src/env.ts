// This file is necessary for the health check to avoid problems with import hoisting in health.ts
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(__dirname, '../../../.env') });