import { test, expect } from '@playwright/test';
import {
  clearLocalStorage,
  switchToEditableTab,
  importFixtureViaUI,
  getNodeCount,
} from './helpers/canvas';

test.describe('Tab Duplication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__node');
  });

  test('context menu shows Duplicate to Edit option', async ({ page }) => {
    const firstTab = page.locator('.flex.items-center.gap-1 button').first();
    await firstTab.click({ button: 'right' });
    await page.waitForTimeout(300);
    const menu = page.locator('[class*="fixed"][class*="rounded-lg"]');
    await expect(menu.locator('button', { hasText: /Duplicate/i })).toBeVisible();
  });

  test('Duplicate creates new tab with same content', async ({ page }) => {
    const initialCount = await getNodeCount(page);
    const firstTab = page.locator('.flex.items-center.gap-1 button').first();
    await firstTab.click({ button: 'right' });
    await page.waitForTimeout(300);
    const menu = page.locator('[class*="fixed"][class*="rounded-lg"]');
    await menu.locator('button', { hasText: /Duplicate/i }).click();
    await page.waitForTimeout(500);
    const dupCount = await getNodeCount(page);
    expect(dupCount).toBe(initialCount);
  });

  test('duplicated tab is editable', async ({ page }) => {
    const firstTab = page.locator('.flex.items-center.gap-1 button').first();
    await firstTab.click({ button: 'right' });
    await page.waitForTimeout(300);
    const menu = page.locator('[class*="fixed"][class*="rounded-lg"]');
    await menu.locator('button', { hasText: /Duplicate/i }).click();
    await page.waitForTimeout(500);
    // Verify we can delete a node (tab is editable)
    const node = page.locator('.react-flow__node').first();
    await node.click();
    await page.keyboard.press('Delete');
    await page.waitForTimeout(300);
  });

  test('modifying duplicated tab does not affect original', async ({ page }) => {
    const originalCount = await getNodeCount(page);
    const firstTab = page.locator('.flex.items-center.gap-1 button').first();
    await firstTab.click({ button: 'right' });
    await page.waitForTimeout(300);
    const menu = page.locator('[class*="fixed"][class*="rounded-lg"]');
    await menu.locator('button', { hasText: /Duplicate/i }).click();
    await page.waitForTimeout(500);

    // Delete a node on the duplicated tab
    const node = page.locator('.react-flow__node').first();
    await node.click();
    await page.keyboard.press('Delete');
    await page.waitForTimeout(500);

    // Switch back to original tab
    await firstTab.click();
    await page.waitForTimeout(500);
    const afterCount = await getNodeCount(page);
    expect(afterCount).toBe(originalCount);
  });
});
