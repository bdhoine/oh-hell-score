import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for Playwright tests
 * Runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  // Optional: Add any global setup here
  // For example: seeding a test database, starting additional services, etc.
  console.log('🎭 Starting Playwright E2E tests...');
}

export default globalSetup;
