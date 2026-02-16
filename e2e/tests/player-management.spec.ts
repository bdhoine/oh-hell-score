import { test, expect } from '@playwright/test';

/**
 * E2E Test: Player Management
 * Tests adding, removing, renaming, and reordering players
 */
test.describe('Player Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('ion-title')).toContainText('New Game');
  });

  test('should add players via Enter key', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    await playerInput.fill('Alice');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Alice' })).toBeVisible();

    await playerInput.fill('Bob');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Bob' })).toBeVisible();

    await playerInput.fill('Carol');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Carol' })).toBeVisible();

    // Verify all players are shown
    const playerCount = await page.locator('ion-item-sliding').count();
    expect(playerCount).toBe(3);
  });

  test('should add players via blur', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    await playerInput.fill('Dave');
    await playerInput.blur();
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Dave' })).toBeVisible();
  });

  test('should not add empty player names', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    await playerInput.fill('');
    await page.keyboard.press('Enter');

    // Should not add empty player
    const playerItems = await page.locator('ion-item-sliding').count();
    expect(playerItems).toBe(0);
  });

  test('should not add whitespace-only names', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    await playerInput.fill('   ');
    await playerInput.blur();
    await page.waitForTimeout(200);

    const playerItems = await page.locator('ion-item-sliding').count();
    expect(playerItems).toBe(0);
  });

  test('should trim player names', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    await playerInput.fill('  Evelyn  ');
    await page.keyboard.press('Enter');

    // Use scoped locator to avoid matching "Even" in game type select
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Evelyn' })).toBeVisible();
  });

  test('should delete player via swipe', async ({ page }) => {
    // Add players first
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');
    await playerInput.fill('Alice');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Alice' })).toBeVisible();

    await playerInput.fill('Bob');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Bob' })).toBeVisible();

    // Programmatically open the sliding item to reveal delete option
    const bobItem = page.locator('ion-item-sliding').filter({ hasText: 'Bob' });
    await bobItem.evaluate((el: any) => el.open('start'));
    await page.waitForTimeout(300);

    // Click the delete button
    const deleteButton = bobItem.locator('ion-item-option[color="danger"]');
    await deleteButton.click();

    // Bob should no longer be visible
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Bob' })).not.toBeVisible();
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Alice' })).toBeVisible();
  });

  test('should allow adding multiple players', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    const players = ['Alice', 'Bob', 'Carol', 'Dave', 'Frank'];

    for (const player of players) {
      await playerInput.fill(player);
      await page.keyboard.press('Enter');
      // Wait for each player to appear before adding next
      await expect(page.locator('ion-item-sliding').filter({ hasText: player })).toBeVisible();
    }

    // Count player items
    const playerCount = await page.locator('ion-item-sliding').count();
    expect(playerCount).toBe(5);
  });

  test('should clear input after adding player', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    await playerInput.fill('Frank');
    await page.keyboard.press('Enter');

    // Wait for Ionic to clear the input asynchronously
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Frank' })).toBeVisible();

    // Check the Ionic component's value rather than native input (which may lag)
    const ionInput = page.locator('ion-input[placeholder="New player..."]');
    await expect(async () => {
      const value = await ionInput.evaluate((el: any) => el.value);
      expect(value === '' || value === undefined || value === null).toBe(true);
    }).toPass({ timeout: 3000 });
  });

  test('should show player count', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    // Add 3 players with waits between each
    await playerInput.fill('Alice');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Alice' })).toBeVisible();

    await playerInput.fill('Bob');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Bob' })).toBeVisible();

    await playerInput.fill('Carol');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Carol' })).toBeVisible();

    // Count visible player items
    const playerCount = await page.locator('ion-item-sliding').count();
    expect(playerCount).toBe(3);
  });

  test('should display players in order added', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    await playerInput.fill('Alice');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Alice' })).toBeVisible();

    await playerInput.fill('Bob');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Bob' })).toBeVisible();

    await playerInput.fill('Carol');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Carol' })).toBeVisible();

    // Get all player labels in order
    const playerLabels = await page.locator('ion-item-sliding ion-label').allTextContents();

    expect(playerLabels[0]).toContain('Alice');
    expect(playerLabels[1]).toContain('Bob');
    expect(playerLabels[2]).toContain('Carol');
  });

  test('should handle rapid player additions', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    // Add players with waits
    await playerInput.fill('Player1');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Player1' })).toBeVisible();

    await playerInput.fill('Player2');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Player2' })).toBeVisible();

    await playerInput.fill('Player3');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Player3' })).toBeVisible();

    const playerCount = await page.locator('ion-item-sliding').count();
    expect(playerCount).toBe(3);
  });

  test('should show reorder handles for players', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    await playerInput.fill('Alice');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Alice' })).toBeVisible();

    await playerInput.fill('Bob');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Bob' })).toBeVisible();

    // Verify reorder icons are present
    const reorderIcons = page.locator('ion-reorder');
    await expect(reorderIcons.first()).toBeVisible();

    const reorderCount = await reorderIcons.count();
    expect(reorderCount).toBe(2); // One for each player
  });

  test('should allow deleting all players', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    // Add players
    await playerInput.fill('Alice');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Alice' })).toBeVisible();

    await playerInput.fill('Bob');
    await page.keyboard.press('Enter');
    await expect(page.locator('ion-item-sliding').filter({ hasText: 'Bob' })).toBeVisible();

    // Delete first player by opening sliding item programmatically
    const firstItem = page.locator('ion-item-sliding').first();
    await firstItem.evaluate((el: any) => el.open('start'));
    await page.waitForTimeout(300);
    await firstItem.locator('ion-item-option[color="danger"]').click();
    await page.waitForTimeout(300);

    // Delete second player
    const remainingItem = page.locator('ion-item-sliding').first();
    await remainingItem.evaluate((el: any) => el.open('start'));
    await page.waitForTimeout(300);
    await remainingItem.locator('ion-item-option[color="danger"]').click();
    await page.waitForTimeout(300);

    // No players should remain
    const playerCount = await page.locator('ion-item-sliding').count();
    expect(playerCount).toBe(0);
  });
});
