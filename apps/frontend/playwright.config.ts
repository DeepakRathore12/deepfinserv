import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against a live frontend and API (see README, Checks). The API must run with
 * NODE_ENV=test so /otp/send returns the code in the response instead of sending an SMS.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
