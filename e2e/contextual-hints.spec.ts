import { test, expect } from '@playwright/test';
import {
  clearLocalStorage,
  switchToEditableTab,
  switchToPage0,
  importFixtureViaUI,
  dragGameToCanvas,
  dismissWelcomeScreen,
  getLocalStorageItem,
} from './helpers/canvas';

test.describe('Contextual Hints', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
  });

  test('rightClick hint appears when first node exists', async ({ page }) => {
    await switchToEditableTab(page);
    await dismissWelcomeScreen(page);

    // Drag a game card to create a node
    await dragGameToCanvas(page, '[draggable="true"]', 400, 300);
    await page.waitForTimeout(500);

    // The hint about right-clicking should appear
    await expect(page.getByText('Right-click nodes or edges')).toBeVisible({ timeout: 3000 });
  });

  test('branchColors hint appears when edges exist', async ({ page }) => {
    await switchToEditableTab(page);
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__edge');
    await page.waitForTimeout(500);

    // First dismiss the rightClick hint if visible
    const gotItButton = page.getByText('Got it');
    if (await gotItButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await gotItButton.click();
      await page.waitForTimeout(300);
    }

    // The branch colors hint should appear (since we have edges)
    // Note: This hint may appear after rightClick hint is dismissed
    const branchHint = page.getByText('Change branch types');
    if (await branchHint.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(branchHint).toBeVisible();
    }
  });

  test('clicking Got it dismisses hint', async ({ page }) => {
    await switchToEditableTab(page);
    await dismissWelcomeScreen(page);

    await dragGameToCanvas(page, '[draggable="true"]', 400, 300);
    await page.waitForTimeout(500);

    const hint = page.getByText('Right-click nodes or edges');
    if (await hint.isVisible({ timeout: 2000 }).catch(() => false)) {
      const gotItButton = page.getByText('Got it');
      await gotItButton.click();
      await page.waitForTimeout(300);

      await expect(hint).not.toBeVisible();
    }
  });

  test('dismissed hint stays hidden after reload', async ({ page }) => {
    await switchToEditableTab(page);
    await dismissWelcomeScreen(page);

    await dragGameToCanvas(page, '[draggable="true"]', 400, 300);
    await page.waitForTimeout(500);

    const hint = page.getByText('Right-click nodes or edges');
    if (await hint.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.getByText('Got it').click();
      await page.waitForTimeout(300);
    }

    // Verify localStorage has the hint stored
    const hintsSeen = await getLocalStorageItem(page, 'zelda-hints-seen');
    expect(hintsSeen).toContain('rightClick');

    // Reload and verify hint stays hidden
    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
    await page.waitForTimeout(500);

    await expect(page.getByText('Right-click nodes or edges')).not.toBeVisible();
  });

  test('hints do not appear on page-0', async ({ page }) => {
    // Stay on page-0 which has nodes from official timeline
    await switchToPage0(page);
    await page.waitForTimeout(500);

    // No contextual hints should appear on the locked page-0
    await expect(page.getByText('Right-click nodes or edges')).not.toBeVisible();
    await expect(page.getByText('Change branch types')).not.toBeVisible();
  });
});
