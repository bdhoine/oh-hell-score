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
    await expect(page.locator('text=Alice')).toBeVisible();

    await playerInput.fill('Bob');
    await page.keyboard.press('Enter');
    await expect(page.locator('text=Bob')).toBeVisible();

    await playerInput.fill('Carol');
    await page.keyboard.press('Enter');
    await expect(page.locator('text=Carol')).toBeVisible();

    // Verify all players are shown
    const players = await page.locator('ion-item:has(ion-label)').allTextContents();
    expect(players.some(p => p.includes('Alice'))).toBeTruthy();
    expect(players.some(p => p.includes('Bob'))).toBeTruthy();
    expect(players.some(p => p.includes('Carol'))).toBeTruthy();
  });

  test('should add players via blur', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    await playerInput.fill('Dave');
    await playerInput.blur();
    await page.waitForTimeout(200);

    await expect(page.locator('text=Dave')).toBeVisible();
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

    await playerInput.fill('  Eve  ');
    await page.keyboard.press('Enter');

    await expect(page.locator('text=Eve')).toBeVisible();
    await expect(page.locator('text=  Eve  ')).not.toBeVisible();
  });

  test('should delete player via swipe', async ({ page }) => {
    // Add players first
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');
    await playerInput.fill('Alice');
    await page.keyboard.press('Enter');
    await playerInput.fill('Bob');
    await page.keyboard.press('Enter');

    // Swipe to reveal delete option
    const bobItem = page.locator('ion-item-sliding:has-text("Bob")');

    // Click the delete button in item options
    const deleteButton = bobItem.locator('ion-item-option[color="danger"]');
    await deleteButton.click();

    // Bob should no longer be visible
    await expect(page.locator('ion-item:has-text("Bob")')).not.toBeVisible();
    await expect(page.locator('text=Alice')).toBeVisible();
  });

  test('should allow adding multiple players', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    const players = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'];

    for (const player of players) {
      await playerInput.fill(player);
      await page.keyboard.press('Enter');
    }

    // Verify all players added
    for (const player of players) {
      await expect(page.locator(`text=${player}`)).toBeVisible();
    }

    // Count player items
    const playerCount = await page.locator('ion-item-sliding').count();
    expect(playerCount).toBe(5);
  });

  test('should clear input after adding player', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    await playerInput.fill('Frank');
    await page.keyboard.press('Enter');

    // Input should be cleared
    const inputValue = await playerInput.inputValue();
    expect(inputValue).toBe('');
  });

  test('should show player count', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    // Add 3 players
    await playerInput.fill('Alice');
    await page.keyboard.press('Enter');
    await playerInput.fill('Bob');
    await page.keyboard.press('Enter');
    await playerInput.fill('Carol');
    await page.keyboard.press('Enter');

    // Count visible player items
    const playerCount = await page.locator('ion-item-sliding').count();
    expect(playerCount).toBe(3);
  });

  test('should display players in order added', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    await playerInput.fill('Alice');
    await page.keyboard.press('Enter');
    await playerInput.fill('Bob');
    await page.keyboard.press('Enter');
    await playerInput.fill('Carol');
    await page.keyboard.press('Enter');

    // Get all player labels in order
    const playerLabels = await page.locator('ion-item-sliding ion-label').allTextContents();

    expect(playerLabels[0]).toContain('Alice');
    expect(playerLabels[1]).toContain('Bob');
    expect(playerLabels[2]).toContain('Carol');
  });

  test('should handle rapid player additions', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    // Rapidly add players
    await playerInput.fill('Player1');
    await page.keyboard.press('Enter');
    await playerInput.fill('Player2');
    await page.keyboard.press('Enter');
    await playerInput.fill('Player3');
    await page.keyboard.press('Enter');

    // Small wait to ensure all adds processed
    await page.waitForTimeout(500);

    const playerCount = await page.locator('ion-item-sliding').count();
    expect(playerCount).toBe(3);
  });

  test('should show reorder handles for players', async ({ page }) => {
    const playerInput = page.locator('ion-input[placeholder="New player..."] input');

    await playerInput.fill('Alice');
    await page.keyboard.press('Enter');
    await playerInput.fill('Bob');
    await page.keyboard.press('Enter');

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
    await playerInput.fill('Bob');
    await page.keyboard.press('Enter');

    // Delete all players
    await page.locator('ion-item-option[color="danger"]').first().click();
    await page.waitForTimeout(200);
    await page.locator('ion-item-option[color="danger"]').first().click();
    await page.waitForTimeout(200);

    // No players should remain
    const playerCount = await page.locator('ion-item-sliding').count();
    expect(playerCount).toBe(0);
  });
});
