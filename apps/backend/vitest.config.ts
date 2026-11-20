import { defineConfig } from 'vitest/config';

const key = Buffer.alloc(32, 7).toString('base64');

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/global-setup.ts'],
    fileParallelism: false,
    testTimeout: 20000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'postgres://dk:dk@localhost:5432/dk_test',
      DATA_ENCRYPTION_KEY: key,
      HASH_PEPPER: key,
      TOKEN_SECRET: key,
      OTP_PROVIDER: 'console',
      CORS_ORIGINS: 'http://localhost:3000',
    },
  },
});
