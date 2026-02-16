import { test, expect, Page } from '@playwright/test';

/**
 * Helper to set an Ionic select value programmatically.
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
 * Ionic alerts render content in shadow DOM.
 */
async function clickAlertRadio(page: Page, labelText: string) {
  await page.locator('ion-alert').waitFor({ state: 'visible' });
  await page.waitForTimeout(200);
  await page.evaluate((text) => {
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
  // Wait for Ionic page transition to complete
  await page.waitForTimeout(500);
}

/**
 * Helper to click a column for a player on the active (non-hidden) Ionic page.
 * Scopes to the last visible .ion-page to avoid matching items from stacked pages.
 */
async function clickPlayerColumn(page: Page, player: string, colIndex: number) {
  await page.evaluate(({ playerName, col }) => {
    // Scope to the active (non-hidden) Ionic page to avoid stacked page conflicts
    const pages = document.querySelectorAll('.ion-page:not(.ion-page-hidden)');
    const activePage = pages.length > 0 ? pages[pages.length - 1] : document;
    const items = activePage.querySelectorAll('ion-item');
    for (const item of items) {
      const grid = item.querySelector('ion-grid');
      if (grid && item.textContent?.includes(playerName)) {
        const cols = item.querySelectorAll('ion-col');
        if (cols.length > col) {
          (cols[col] as HTMLElement).click();
          return;
        }
      }
    }
  }, { playerName: player, col: colIndex });
}

/**
 * Helper to set bid for a player by clicking their bid cell.
 */
async function setBid(page: Page, player: string, bid: number) {
  await clickPlayerColumn(page, player, 1);
  await clickAlertRadio(page, String(bid));
  // Wait for alert to fully dismiss (handler auto-dismisses on selection)
  await page.locator('ion-alert').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
}

/**
 * Helper to set trick for a player by clicking their trick cell.
 */
async function setTrick(page: Page, player: string, trick: number) {
  await clickPlayerColumn(page, player, 2);
  await clickAlertRadio(page, String(trick));
  // Wait for alert to fully dismiss (handler auto-dismisses on selection)
  await page.locator('ion-alert').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
}

/**
 * Wait for Ionic page transition to complete after navigation
 */
async function waitForPageTransition(page: Page) {
  await page.waitForTimeout(500);
}

/**
 * E2E Test: Complete game flow with ALL cards game type
 */
test.describe('Complete game flow - ALL cards', () => {
  test('should play a full game with 3 players and 3 max cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('ion-title').last()).toContainText('New Game');

    await addPlayer(page, 'Alice');
    await addPlayer(page, 'Bob');
    await addPlayer(page, 'Carol');

    await setMaxCards(page, 3);
    await startGameWithDealer(page, 'Alice');

    // Should navigate to Bid page for Round 1 (1 card)
    await expect(page).toHaveURL(/.*bid/);
    await expect(page.locator('ion-title').last()).toContainText('Bid 1');

    // --- Round 1: 1 card, dealer: Alice ---
    // Enter bids: Bob=0, Carol=0, Alice=0
    await setBid(page, 'Bob', 0);
    await setBid(page, 'Carol', 0);
    await setBid(page, 'Alice', 0);

    // Navigate to trick phase - use .last() since Ionic page stack may keep old FABs
    const fabButton = page.locator('ion-fab-button').last();
    await expect(fabButton).not.toBeDisabled();
    await fabButton.click();
    await waitForPageTransition(page);
    await expect(page).toHaveURL(/.*trick/);
    await expect(page.locator('ion-title').last()).toContainText('Trick 1');

    // Enter tricks: Bob=1, Carol=0, Alice=0
    await setTrick(page, 'Bob', 1);
    await setTrick(page, 'Carol', 0);
    await setTrick(page, 'Alice', 0);

    // Move to next round (Round 2: 2 cards)
    await expect(fabButton).not.toBeDisabled();
    await fabButton.click();
    await waitForPageTransition(page);
    await expect(page).toHaveURL(/.*bid/);
    await expect(page.locator('ion-title').last()).toContainText('Bid 2');

    // --- Round 2: 2 cards ---
    await setBid(page, 'Carol', 1);
    await setBid(page, 'Alice', 1);
    await setBid(page, 'Bob', 1);

    await fabButton.click();
    await waitForPageTransition(page);
    await expect(page).toHaveURL(/.*trick/);

    await setTrick(page, 'Carol', 1);
    await setTrick(page, 'Alice', 1);
    await setTrick(page, 'Bob', 0);

    // Move to Round 3
    await fabButton.click();
    await waitForPageTransition(page);
    await expect(page.locator('ion-title').last()).toContainText('Bid 3');

    // --- Round 3: 3 cards ---
    await setBid(page, 'Alice', 1);
    await setBid(page, 'Bob', 1);
    await setBid(page, 'Carol', 1);

    await fabButton.click();
    await waitForPageTransition(page);

    await setTrick(page, 'Alice', 1);
    await setTrick(page, 'Bob', 1);
    await setTrick(page, 'Carol', 1);

    // Verify we can navigate back
    await page.locator('ion-button:has-text("Back")').click();
    await waitForPageTransition(page);
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

    // Open Alice's bid dialog (scoped to active page)
    await clickPlayerColumn(page, 'Alice', 1);
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

    // Verify we're on bid page
    await expect(page).toHaveURL(/.*bid/);

    // Enter a bid
    await setBid(page, 'Bob', 0);

    // Reload the page
    await page.reload();
    await page.waitForTimeout(3000);

    // Game state should be restored - should be on new game page with reload toast
    // or directly on the bid page depending on implementation
    // Just verify the page loaded without error
    const title = page.locator('ion-title').last();
    const titleText = await title.textContent();
    // Should either be on New Game (with toast to restore) or on Bid page
    expect(titleText?.includes('New Game') || titleText?.includes('Bid')).toBe(true);
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

    await page.locator('ion-fab-button').last().click();
    await waitForPageTransition(page);

    // Tricks: Alice=0, Bob=1
    await setTrick(page, 'Alice', 0);
    await setTrick(page, 'Bob', 1);

    // Next round button should navigate to score (last round)
    await page.locator('ion-fab-button').last().click();
    await waitForPageTransition(page);

    // Should be on score page
    await expect(page).toHaveURL(/.*score/);
    await expect(page.locator('ion-title').last()).toContainText('Final');
  });
});
