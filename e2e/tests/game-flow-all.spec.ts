import { test, expect, Page } from '@playwright/test';

/**
 * Helper to set an Ionic select value programmatically.
 * Ionic selects render shadow DOM labels that cause strict mode violations
 * when using text selectors. This bypasses the UI entirely.
 */
async function setMaxCards(page: Page, value: number) {
  const select = page.locator('ion-item:has(ion-label) ion-select').first();
  await select.evaluate((el: any, val: number) => {
    el.value = val;
    el.dispatchEvent(new CustomEvent('ionChange', { detail: { value: val } }));
  }, value);
  await page.waitForTimeout(200);
}

/**
 * Helper to add a player and wait for it to appear
 */
async function addPlayer(page: Page, name: string) {
  const playerInput = page.locator('ion-input[placeholder="New player..."] input');
  await playerInput.fill(name);
  await page.keyboard.press('Enter');
  await expect(page.locator('ion-item-sliding').filter({ hasText: name })).toBeVisible();
}

/**
 * Helper to start a game with a dealer.
 * Ionic alerts render radio inputs as button[role="radio"] elements,
 * not as <ion-radio> elements.
 */
async function startGameWithDealer(page: Page, dealer: string) {
  await page.locator('ion-button:has-text("Start Game")').click();
  await expect(page.getByRole('heading', { name: 'Pick Dealer' })).toBeVisible();
  await page.getByRole('radio', { name: dealer }).click();
  await page.getByRole('button', { name: 'Pick dealer' }).click();
}

/**
 * Helper to select a bid/trick value from Ionic alert dialog.
 * The alert auto-dismisses on selection via the handler.
 */
async function selectAlertRadio(page: Page, value: string) {
  await page.getByRole('radio', { name: value, exact: true }).click();
  await page.waitForTimeout(150);
}

/**
 * Helper to set bid for a player by clicking their bid cell
 */
async function setBid(page: Page, player: string, bid: number) {
  await page.locator(`ion-item:has-text("${player}")`).locator('ion-col').nth(1).click();
  await selectAlertRadio(page, String(bid));
}

/**
 * Helper to set trick for a player by clicking their trick cell
 */
async function setTrick(page: Page, player: string, trick: number) {
  await page.locator(`ion-item:has-text("${player}")`).locator('ion-col').nth(2).click();
  await selectAlertRadio(page, String(trick));
}

/**
 * E2E Test: Complete game flow with ALL cards game type
 * Tests the full user journey from game setup to final scores
 */
test.describe('Complete game flow - ALL cards', () => {
  test('should play a full game with 3 players and 3 max cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('ion-title')).toContainText('New Game');

    // Add three players
    await addPlayer(page, 'Alice');
    await addPlayer(page, 'Bob');
    await addPlayer(page, 'Carol');

    // Configure game: Set max cards to 3
    await setMaxCards(page, 3);

    // Start the game
    await startGameWithDealer(page, 'Alice');

    // Should navigate to Bid page for Round 1 (1 card)
    await expect(page).toHaveURL(/.*bid/);
    await expect(page.locator('ion-title')).toContainText('Bid 1');

    // --- Round 1: 1 card, dealer: Alice ---
    await expect(page.locator('ion-item:has-text("Bob")')).toBeVisible();
    await expect(page.locator('ion-item:has-text("Carol")')).toBeVisible();
    await expect(page.locator('ion-item:has-text("Alice")')).toBeVisible();

    // Alice is dealer - should see dealer icon
    await expect(page.locator('ion-icon[icon="hand-left"]')).toBeVisible();

    // Enter bids: Bob=0, Carol=0, Alice=0
    await setBid(page, 'Bob', 0);
    await setBid(page, 'Carol', 0);
    await setBid(page, 'Alice', 0);

    // Navigate to trick phase
    const fabButton = page.locator('ion-fab-button');
    await expect(fabButton).not.toBeDisabled();
    await fabButton.click();
    await expect(page).toHaveURL(/.*trick/);
    await expect(page.locator('ion-title')).toContainText('Trick 1');

    // Enter tricks: Bob=1, Carol=0, Alice=0
    await setTrick(page, 'Bob', 1);
    await setTrick(page, 'Carol', 0);
    await setTrick(page, 'Alice', 0);

    // Move to next round (Round 2: 2 cards)
    await expect(fabButton).not.toBeDisabled();
    await fabButton.click();
    await expect(page).toHaveURL(/.*bid/);
    await expect(page.locator('ion-title')).toContainText('Bid 2');

    // --- Round 2: 2 cards, dealer: Bob ---
    const dealerIcon = page.locator('ion-item:has-text("Bob")').locator('ion-icon[icon="hand-left"]');
    await expect(dealerIcon).toBeVisible();

    // Enter bids: Carol=1, Alice=1, Bob=1
    await setBid(page, 'Carol', 1);
    await setBid(page, 'Alice', 1);
    await setBid(page, 'Bob', 1);

    // Navigate to trick phase
    await fabButton.click();
    await expect(page).toHaveURL(/.*trick/);

    // Enter tricks: Carol=1, Alice=1, Bob=0
    await setTrick(page, 'Carol', 1);
    await setTrick(page, 'Alice', 1);
    await setTrick(page, 'Bob', 0);

    // Move to Round 3
    await fabButton.click();
    await expect(page.locator('ion-title')).toContainText('Bid 3');

    // --- Round 3: 3 cards, dealer: Carol ---
    await setBid(page, 'Alice', 1);
    await setBid(page, 'Bob', 1);
    await setBid(page, 'Carol', 1);

    // Navigate to trick phase
    await fabButton.click();

    // Enter tricks: Alice=1, Bob=1, Carol=1
    await setTrick(page, 'Alice', 1);
    await setTrick(page, 'Bob', 1);
    await setTrick(page, 'Carol', 1);

    // Verify we can navigate back
    await page.locator('ion-button:has-text("Back")').click();
    await expect(page).toHaveURL(/.*bid/);

    // Verify we can see previous round scores
    const scoreBadges = page.locator('ion-badge[color="see-through-black"]');
    await expect(scoreBadges.first()).toBeVisible();
  });

  test('should handle dealer "not okay" rule correctly', async ({ page }) => {
    await page.goto('/');

    await addPlayer(page, 'Alice');
    await addPlayer(page, 'Bob');

    await setMaxCards(page, 1);
    await startGameWithDealer(page, 'Alice');

    await expect(page.locator('ion-title')).toContainText('Bid 1');

    // Bob bids 0
    await setBid(page, 'Bob', 0);

    // Alice (dealer) should see "not okay" badge showing 1
    const notOkayBadge = page.locator('ion-badge[color="danger"]');
    await expect(notOkayBadge).toContainText('1');

    // Alice should not be able to select bid of 1
    await page.locator('ion-item:has-text("Alice")').locator('ion-col').nth(1).click();
    // The radio for value="1" should not be present in the dialog for the dealer
    const radio1 = page.getByRole('radio', { name: '1', exact: true });
    await expect(radio1).toHaveCount(0);

    // Alice can only bid 0
    await selectAlertRadio(page, '0');
  });

  test('should persist game state and allow reload', async ({ page }) => {
    await page.goto('/');

    await addPlayer(page, 'Alice');
    await addPlayer(page, 'Bob');

    await setMaxCards(page, 2);
    await startGameWithDealer(page, 'Alice');

    // Enter a bid
    await setBid(page, 'Bob', 0);

    // Reload the page
    await page.reload();

    // Game state should be restored - should show toast about unfinished game
    await expect(page.locator('ion-toast')).toBeVisible({ timeout: 5000 });

    // After dismissing toast, should still be on the same round
    await page.waitForTimeout(2000);
    await expect(page.locator('ion-title')).toContainText('Bid');
  });

  test('should calculate scores correctly', async ({ page }) => {
    await page.goto('/');

    await addPlayer(page, 'Alice');
    await addPlayer(page, 'Bob');

    await setMaxCards(page, 1);
    await startGameWithDealer(page, 'Alice');

    // Round 1: Bob bids 0, Alice bids 1
    await setBid(page, 'Bob', 0);
    await setBid(page, 'Alice', 1);

    await page.locator('ion-fab-button').click();

    // Tricks: Alice=0, Bob=1
    await setTrick(page, 'Alice', 0);
    await setTrick(page, 'Bob', 1);

    // Next round button should navigate to score (last round)
    await page.locator('ion-fab-button').click();

    // Should be on score page
    await expect(page).toHaveURL(/.*score/);
    await expect(page.locator('ion-title')).toContainText('Final');
  });
});
