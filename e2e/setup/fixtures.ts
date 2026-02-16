import { test as base, Page } from '@playwright/test';

/**
 * Custom fixtures for E2E tests
 * Provides reusable test helpers and utilities
 */

type GameFixtures = {
  setupGame: (players: string[], maxCards?: number) => Promise<void>;
  enterBid: (player: string, bid: number) => Promise<void>;
  enterTrick: (player: string, tricks: number) => Promise<void>;
};

export const test = base.extend<GameFixtures>({
  /**
   * Helper to set up a new game with players
   */
  setupGame: async ({ page }, use) => {
    const setupGameFn = async (players: string[], maxCards: number = 3) => {
      await page.goto('/');

      // Add players
      for (const player of players) {
        await page.getByPlaceholder('New player...').fill(player);
        await page.keyboard.press('Enter');
        // Wait a bit for the player to be added
        await page.waitForTimeout(100);
      }

      // Set max cards if different from default
      if (maxCards !== 7) {
        await page.getByText('Maximum Cards').click();
        await page.getByText(maxCards.toString()).click();
      }

      // Start game and pick first player as dealer
      await page.getByText('Start Game').click();
      await page.getByLabel(players[0]).check();
      await page.getByText('Pick dealer').click();

      // Wait for navigation to bid page
      await page.waitForURL(/.*bid/);
    };

    await use(setupGameFn);
  },

  /**
   * Helper to enter a bid for a player
   */
  enterBid: async ({ page }, use) => {
    const enterBidFn = async (player: string, bid: number) => {
      // Find the player's row and click to open bid picker
      await page.locator(`ion-item:has-text("${player}")`).click();

      // Select the bid
      await page.getByText(bid.toString()).click();
    };

    await use(enterBidFn);
  },

  /**
   * Helper to enter tricks won for a player
   */
  enterTrick: async ({ page }, use) => {
    const enterTrickFn = async (player: string, tricks: number) => {
      // Find the player's row and click to open trick picker
      await page.locator(`ion-item:has-text("${player}")`).click();

      // Select the tricks
      await page.getByText(tricks.toString()).click();
    };

    await use(enterTrickFn);
  },
});

export { expect } from '@playwright/test';
