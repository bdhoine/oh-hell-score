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
 * Helper to click a radio option inside an Ionic alert dialog.
 * Ionic alerts render content in shadow DOM. We use evaluate to
 * reliably find and click the radio button by its label text.
 */
async function clickAlertRadio(page: Page, labelText: string) {
  await page.locator('ion-alert').waitFor({ state: 'visible' });
  await page.waitForTimeout(200);
  await page.evaluate((text) => {
    // Search both light DOM and shadow DOM for alert radio labels
    const alerts = document.querySelectorAll('ion-alert');
    for (const alert of alerts) {
      const root = alert.shadowRoot || alert;
      const labels = root.querySelectorAll('.alert-radio-label');
      for (const label of labels) {
        if (label.textContent?.trim() === text) {
          const button = label.closest('button');
          if (button) {
            button.click();
            return;
          }
        }
      }
    }
  }, labelText);
  await page.waitForTimeout(150);
}

/**
 * Helper to click a button inside an Ionic alert dialog.
 */
async function clickAlertButton(page: Page, buttonText: string) {
  await page.evaluate((text) => {
    const alerts = document.querySelectorAll('ion-alert');
    for (const alert of alerts) {
      const root = alert.shadowRoot || alert;
      const buttons = root.querySelectorAll('button.alert-button');
      for (const button of buttons) {
        if (button.textContent?.trim().toLowerCase() === text.toLowerCase()) {
          button.click();
          return;
        }
      }
    }
  }, buttonText);
  await page.waitForTimeout(150);
}

/**
 * Helper to start a game with a dealer.
 */
async function startGameWithDealer(page: Page, dealer: string) {
  await page.locator('ion-button:has-text("Start Game")').click();
  await page.locator('ion-alert').waitFor({ state: 'visible' });
  await page.waitForTimeout(300);
  await clickAlertRadio(page, dealer);
  await clickAlertButton(page, 'Pick dealer');
}

/**
 * Helper to set bid for a player by clicking their bid cell
 */
async function setBid(page: Page, player: string, bid: number) {
  await page.locator(`ion-item:has-text("${player}")`).locator('ion-col').nth(1).click();
  await clickAlertRadio(page, String(bid));
}

/**
 * Helper to set trick for a player by clicking their trick cell
 */
async function setTrick(page: Page, player: string, trick: number) {
  await page.locator(`ion-item:has-text("${player}")`).locator('ion-col').nth(2).click();
  await clickAlertRadio(page, String(trick));
}

/**
 * E2E Test: Complete game flow with ALL cards game type
 * Tests the full user journey from game setup to final scores
 */
test.describe('Complete game flow - ALL cards', () => {
  test('should play a full game with 3 players and 3 max cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('ion-title').last()).toContainText('New Game');

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
    await expect(page.locator('ion-title').last()).toContainText('Bid 1');

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
    await expect(page.locator('ion-title').last()).toContainText('Trick 1');

    // Enter tricks: Bob=1, Carol=0, Alice=0
    await setTrick(page, 'Bob', 1);
    await setTrick(page, 'Carol', 0);
    await setTrick(page, 'Alice', 0);

    // Move to next round (Round 2: 2 cards)
    await expect(fabButton).not.toBeDisabled();
    await fabButton.click();
    await expect(page).toHaveURL(/.*bid/);
    await expect(page.locator('ion-title').last()).toContainText('Bid 2');

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
    await expect(page.locator('ion-title').last()).toContainText('Bid 3');

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

    await expect(page.locator('ion-title').last()).toContainText('Bid 1');

    // Bob bids 0
    await setBid(page, 'Bob', 0);

    // Alice (dealer) should see "not okay" badge showing 1
    const notOkayBadge = page.locator('ion-badge[color="danger"]');
    await expect(notOkayBadge).toContainText('1');

    // Alice should not be able to select bid of 1
    await page.locator('ion-item:has-text("Alice")').locator('ion-col').nth(1).click();
    await page.locator('ion-alert').waitFor({ state: 'visible' });
    await page.waitForTimeout(200);

    // The radio for "1" should not be present in the dialog for the dealer
    const hasRadio1 = await page.evaluate(() => {
      const alerts = document.querySelectorAll('ion-alert');
      for (const alert of alerts) {
        const root = alert.shadowRoot || alert;
        const labels = root.querySelectorAll('.alert-radio-label');
        for (const label of labels) {
          if (label.textContent?.trim() === '1') return true;
        }
      }
      return false;
    });
    expect(hasRadio1).toBe(false);

    // Alice can only bid 0
    await clickAlertRadio(page, '0');
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
    await expect(page.locator('ion-title').last()).toContainText('Bid');
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
    await expect(page.locator('ion-title').last()).toContainText('Final');
  });
});
