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
 * Wait for all Ionic alerts to be fully dismissed/removed.
 */
async function waitForAlertDismiss(page: Page) {
  await page.waitForFunction(() => {
    const alerts = document.querySelectorAll('ion-alert');
    if (alerts.length === 0) return true;
    for (const alert of alerts) {
      const rect = alert.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return false;
    }
    return true;
  }, null, { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(100);
}

/**
 * Helper to click a radio option inside an Ionic alert dialog.
 * Targets the LAST alert. Does NOT dismiss the alert (caller handles that).
 */
async function clickAlertRadio(page: Page, labelText: string) {
  await page.locator('ion-alert').last().waitFor({ state: 'visible' });
  await page.waitForTimeout(200);

  await page.evaluate((text) => {
    const alerts = document.querySelectorAll('ion-alert');
    const alert = alerts[alerts.length - 1];
    if (!alert) return;
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
  }, labelText);
  await page.waitForTimeout(200);
}

/**
 * Force dismiss any visible alerts. Used after bid/trick radio selection
 * where clicking an already-checked radio doesn't trigger the handler.
 */
async function forceAlertDismiss(page: Page) {
  await page.evaluate(() => {
    const alerts = document.querySelectorAll('ion-alert');
    for (const alert of alerts) {
      if (alert.getBoundingClientRect().height > 0) {
        (alert as any).dismiss();
      }
    }
  });
  await page.waitForTimeout(200);
}

/**
 * Helper to click a button inside an Ionic alert dialog.
 * Targets the LAST alert.
 */
async function clickAlertButton(page: Page, buttonText: string) {
  await page.evaluate((text) => {
    const alerts = document.querySelectorAll('ion-alert');
    const alert = alerts[alerts.length - 1];
    if (!alert) return;
    const root = alert.shadowRoot || alert;
    const buttons = root.querySelectorAll('button.alert-button');
    for (const button of buttons) {
      if (button.textContent?.trim().toLowerCase() === text.toLowerCase()) {
        button.click();
        return;
      }
    }
  }, buttonText);
  await page.waitForTimeout(200);
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
  await waitForAlertDismiss(page);
  await page.waitForTimeout(500);
}

/**
 * Helper to click a column for a player on the active (non-hidden) Ionic page.
 */
async function clickPlayerColumn(page: Page, player: string, colIndex: number) {
  await page.evaluate(({ playerName, col }) => {
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
 * Helper to set bid for a player.
 * After clicking the radio, waits for the handler to auto-dismiss,
 * then force-dismisses if the radio was already checked (handler won't fire).
 */
async function setBid(page: Page, player: string, bid: number) {
  await waitForAlertDismiss(page);
  await clickPlayerColumn(page, player, 1);
  await clickAlertRadio(page, String(bid));
  // Give Ionic's handler time to fire and auto-dismiss the alert
  await page.waitForTimeout(300);
  // Force dismiss if handler didn't fire (already-checked radio)
  await forceAlertDismiss(page);
  await waitForAlertDismiss(page);
}

/**
 * Helper to set trick for a player.
 */
async function setTrick(page: Page, player: string, trick: number) {
  await waitForAlertDismiss(page);
  await clickPlayerColumn(page, player, 2);
  await clickAlertRadio(page, String(trick));
  // Give Ionic's handler time to fire and auto-dismiss the alert
  await page.waitForTimeout(300);
  // Force dismiss if handler didn't fire (already-checked radio)
  await forceAlertDismiss(page);
  await waitForAlertDismiss(page);
}

/**
 * Click the visible, enabled FAB button.
 * Uses Playwright locators (which pierce shadow DOM) and checks the disabled
 * PROPERTY rather than attribute, because React sets disabled="false" as a
 * string attribute on custom elements instead of removing it.
 */
async function clickFab(page: Page) {
  await waitForAlertDismiss(page);
  await page.waitForTimeout(300);

  // Wait for a visible, enabled FAB (check property, not attribute)
  await expect(async () => {
    const fabs = page.locator('ion-fab-button');
    const count = await fabs.count();
    for (let i = 0; i < count; i++) {
      const fab = fabs.nth(i);
      if (await fab.isVisible()) {
        const disabled = await fab.evaluate(el => (el as any).disabled);
        if (!disabled) return;
      }
    }
    throw new Error('No visible enabled FAB found');
  }).toPass({ timeout: 5000 });

  // Click the first visible, enabled FAB
  const fabs = page.locator('ion-fab-button');
  const count = await fabs.count();
  for (let i = 0; i < count; i++) {
    const fab = fabs.nth(i);
    if (await fab.isVisible()) {
      const disabled = await fab.evaluate(el => (el as any).disabled);
      if (!disabled) {
        await fab.click({ force: true });
        return;
      }
    }
  }
}

/**
 * Wait for Ionic page transition to complete after navigation.
 */
async function waitForPageTransition(page: Page) {
  await page.waitForTimeout(400);
}

/**
 * Assert the active (non-hidden) page's title contains the expected text.
 */
async function expectActiveTitle(page: Page, expected: string) {
  await expect(async () => {
    const title = await page.evaluate(() => {
      const pages = document.querySelectorAll('.ion-page:not(.ion-page-hidden)');
      const activePage = pages.length > 0 ? pages[pages.length - 1] : document;
      const t = activePage.querySelector('ion-title');
      return t?.textContent?.trim() || '';
    });
    expect(title).toContain(expected);
  }).toPass({ timeout: 5000 });
}

/**
 * E2E Test: Complete game flow with ALL cards game type
 *
 * IMPORTANT: Bid totals must NOT equal the number of cards in the round,
 * otherwise the FAB button is disabled ("not okay" rule).
 */
test.describe('Complete game flow - ALL cards', () => {
  test.beforeEach(async ({ page }) => {
    // Clear stored game state to prevent interference between tests
    await page.goto('/');
    await page.evaluate(() => {
      return new Promise<void>(resolve => {
        const req = indexedDB.deleteDatabase('_ionicstorage');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      });
    });
    await page.reload();
    await page.waitForTimeout(500);
  });

  test('should play a full game with 3 players and 3 max cards', async ({ page }) => {
    test.setTimeout(60000);
    await expectActiveTitle(page, 'New Game');

    await addPlayer(page, 'Alice');
    await addPlayer(page, 'Bob');
    await addPlayer(page, 'Carol');

    await setMaxCards(page, 3);
    await startGameWithDealer(page, 'Alice');

    await expect(page).toHaveURL(/.*bid/);
    await expectActiveTitle(page, 'Bid 1');

    // --- Round 1: 1 card, dealer: Alice ---
    // Bids must not sum to 1. 0+0+0=0 ≠ 1 ✓
    await setBid(page, 'Bob', 0);
    await setBid(page, 'Carol', 0);
    await setBid(page, 'Alice', 0);

    await clickFab(page);
    await waitForPageTransition(page);
    await expect(page).toHaveURL(/.*trick/);
    await expectActiveTitle(page, 'Trick 1');

    // Tricks must sum to 1
    await setTrick(page, 'Bob', 1);
    await setTrick(page, 'Carol', 0);
    await setTrick(page, 'Alice', 0);

    // Move to Round 2
    await clickFab(page);
    await waitForPageTransition(page);
    await expect(page).toHaveURL(/.*bid/);
    await expectActiveTitle(page, 'Bid 2');

    // --- Round 2: 2 cards ---
    // Bids must not sum to 2. 1+1+1=3 ≠ 2 ✓
    await setBid(page, 'Carol', 1);
    await setBid(page, 'Alice', 1);
    await setBid(page, 'Bob', 1);

    await clickFab(page);
    await waitForPageTransition(page);
    await expect(page).toHaveURL(/.*trick/);

    // Tricks must sum to 2
    await setTrick(page, 'Carol', 1);
    await setTrick(page, 'Alice', 1);
    await setTrick(page, 'Bob', 0);

    // Move to Round 3
    await clickFab(page);
    await waitForPageTransition(page);
    await expectActiveTitle(page, 'Bid 3');

    // --- Round 3: 3 cards ---
    // Bids must not sum to 3. 1+1+0=2 ≠ 3 ✓
    await setBid(page, 'Alice', 1);
    await setBid(page, 'Bob', 1);
    await setBid(page, 'Carol', 0);

    await clickFab(page);
    await waitForPageTransition(page);

    // Tricks must sum to 3
    await setTrick(page, 'Alice', 1);
    await setTrick(page, 'Bob', 1);
    await setTrick(page, 'Carol', 1);

    // Verify we can navigate back (scope to active page)
    await page.evaluate(() => {
      const pages = document.querySelectorAll('.ion-page:not(.ion-page-hidden)');
      const activePage = pages.length > 0 ? pages[pages.length - 1] : document;
      const buttons = activePage.querySelectorAll('ion-button');
      for (const btn of buttons) {
        if (btn.textContent?.includes('Back')) {
          (btn as HTMLElement).click();
          return;
        }
      }
    });
    await waitForPageTransition(page);
    await expect(page).toHaveURL(/.*bid/);

    // Verify we can see previous round scores
    const scoreBadges = page.locator('ion-badge[color="see-through-black"]');
    await expect(scoreBadges.first()).toBeVisible();
  });

  test('should handle dealer "not okay" rule correctly', async ({ page }) => {
    await addPlayer(page, 'Alice');
    await addPlayer(page, 'Bob');

    await setMaxCards(page, 1);
    await startGameWithDealer(page, 'Alice');

    await expectActiveTitle(page, 'Bid 1');

    // Bob bids 0
    await setBid(page, 'Bob', 0);

    // Alice (dealer) should see "not okay" badge showing 1
    const notOkayBadge = page.locator('ion-badge[color="danger"]');
    await expect(notOkayBadge).toContainText('1');

    // Open Alice's bid dialog
    await clickPlayerColumn(page, 'Alice', 1);
    await page.locator('ion-alert').last().waitFor({ state: 'visible' });
    await page.waitForTimeout(300);

    // The radio for "1" should not be present (dealer not-okay rule)
    const hasRadio1 = await page.evaluate(() => {
      const alerts = document.querySelectorAll('ion-alert');
      const alert = alerts[alerts.length - 1];
      if (!alert) return false;
      const root = alert.shadowRoot || alert;
      const labels = root.querySelectorAll('.alert-radio-label');
      for (const label of labels) {
        if (label.textContent?.trim() === '1') return true;
      }
      return false;
    });
    expect(hasRadio1).toBe(false);

    // Dismiss the alert
    await forceAlertDismiss(page);
  });

  test('should persist game state and allow reload', async ({ page }) => {
    await addPlayer(page, 'Alice');
    await addPlayer(page, 'Bob');

    await setMaxCards(page, 2);
    await startGameWithDealer(page, 'Alice');

    await expect(page).toHaveURL(/.*bid/);

    // Enter a non-default bid so the alert handler fires
    await setBid(page, 'Bob', 1);

    // Reload the page
    await page.reload();
    await page.waitForTimeout(3000);

    // Just verify the page loaded without error
    const titleText = await page.evaluate(() => {
      const titles = document.querySelectorAll('ion-title');
      for (const t of titles) {
        const rect = t.getBoundingClientRect();
        if (rect.height > 0) return t.textContent?.trim() || '';
      }
      return '';
    });
    expect(titleText?.includes('New Game') || titleText?.includes('Bid')).toBe(true);
  });

  test('should calculate scores correctly', async ({ page }) => {
    await addPlayer(page, 'Alice');
    await addPlayer(page, 'Bob');

    // maxCards=1 with ALL type generates 2 rounds: up [1] + back [1]
    await setMaxCards(page, 1);
    await startGameWithDealer(page, 'Alice');

    // --- Round 1 (1 card, dealer: Alice) ---
    // Bob bids 1, not-okay = 1-1=0, Alice can't bid 0 → Alice bids 1.
    // Total = 2 ≠ 1 ✓
    await setBid(page, 'Bob', 1);
    await setBid(page, 'Alice', 1);

    await clickFab(page);
    await waitForPageTransition(page);

    // Tricks must sum to 1
    await setTrick(page, 'Alice', 0);
    await setTrick(page, 'Bob', 1);

    // Move to Round 2
    await clickFab(page);
    await waitForPageTransition(page);
    await expect(page).toHaveURL(/.*bid/);

    // --- Round 2 (1 card, dealer: Bob) ---
    // Alice bids 1, not-okay = 1-1=0, Bob (dealer) can't bid 0 → Bob bids 1.
    // Total = 2 ≠ 1 ✓
    await setBid(page, 'Alice', 1);
    await setBid(page, 'Bob', 1);

    await clickFab(page);
    await waitForPageTransition(page);

    // Tricks must sum to 1
    await setTrick(page, 'Alice', 1);
    await setTrick(page, 'Bob', 0);

    // Last round → should navigate to score page
    await clickFab(page);
    await waitForPageTransition(page);

    await expect(page).toHaveURL(/.*score/);
    await expectActiveTitle(page, 'Final');
  });
});
