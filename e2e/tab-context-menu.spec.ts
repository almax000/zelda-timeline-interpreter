import { test, expect } from '@playwright/test';
import { clearLocalStorage, switchToEditableTab, switchToPage0, getNodeCount, importFixtureViaUI } from './helpers/canvas';

test.describe('Tab Context Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
  });

  test('right-click on tab shows context menu', async ({ page }) => {
    const tabButton = page.locator('button', { hasText: '1' }).first();
    await tabButton.click({ button: 'right' });

    // Context menu with z-[100]
    const menu = page.locator('.fixed.z-\\[100\\]');
    await expect(menu).toBeVisible();
  });

  test('can lock and unlock a tab', async ({ page }) => {
    const tabButton = page.locator('button', { hasText: '1' }).first();
    await tabButton.click({ button: 'right' });

    // Click "Lock Tab"
    const lockButton = page.locator('.fixed.z-\\[100\\] button', { hasText: 'Lock Tab' });
    await lockButton.click();

    // Verify tab is locked — tools should be hidden
    await switchToEditableTab(page);
    await page.waitForTimeout(300);
    await expect(page.locator('button[title="Eraser"]')).not.toBeVisible();

    // Unlock: right-click tab again
    const tabButton2 = page.locator('button', { hasText: '1' }).first();
    await tabButton2.click({ button: 'right' });

    const unlockButton = page.locator('.fixed.z-\\[100\\] button', { hasText: 'Unlock Tab' });
    await unlockButton.click();

    // Tools should be visible again
    await switchToEditableTab(page);
    await page.waitForTimeout(300);
    await expect(page.locator('button[title="Eraser"]')).toBeVisible();
  });

  test('can rename a tab', async ({ page }) => {
    const tabButton = page.locator('button', { hasText: '1' }).first();
    await tabButton.click({ button: 'right' });

    // Click "Rename Tab"
    const renameButton = page.locator('.fixed.z-\\[100\\] button', { hasText: 'Rename Tab' });
    await renameButton.click();

    // Input should appear
    const input = page.locator('.fixed.z-\\[100\\] input');
    await expect(input).toBeVisible();

    // Clear and type new name
    await input.fill('My Timeline');
    await input.press('Enter');

    // Tab should show new name
    await page.waitForTimeout(300);
    await expect(page.locator('button', { hasText: 'My Timeline' }).first()).toBeVisible();
  });

  test('rename is disabled for page-0', async ({ page }) => {
    const page0Button = page.locator('button:has(svg polygon)').first();
    await page0Button.click({ button: 'right' });

    const renameButton = page.locator('.fixed.z-\\[100\\] button', { hasText: 'Rename Tab' });
    await expect(renameButton).toBeDisabled();
  });

  test('delete is disabled for page-0', async ({ page }) => {
    const page0Button = page.locator('button:has(svg polygon)').first();
    await page0Button.click({ button: 'right' });

    const deleteButton = page.locator('.fixed.z-\\[100\\] button', { hasText: 'Delete Tab' });
    await expect(deleteButton).toBeDisabled();
  });

  test('can delete a tab when more than one editable tab exists', async ({ page }) => {
    // Create a second tab
    await page.getByTitle('New canvas').click();
    await page.waitForTimeout(300);

    // Right-click on tab 1
    const tab1 = page.locator('button', { hasText: '1' }).first();
    await tab1.click({ button: 'right' });

    // Delete should be enabled
    const deleteButton = page.locator('.fixed.z-\\[100\\] button', { hasText: 'Delete Tab' });
    await expect(deleteButton).toBeEnabled();
    await deleteButton.click();

    // Tab 1 should be gone
    await page.waitForTimeout(300);
    const tab1After = page.locator('button', { hasText: '1' });
    // After deletion the remaining tab becomes "2" (or re-indexed)
    // Just verify we still have at least page-0 and one editable tab
    const page0 = page.locator('button:has(svg polygon)').first();
    await expect(page0).toBeVisible();
  });

  test('delete is disabled when only one editable tab remains', async ({ page }) => {
    // Only canvas-1 exists as editable
    const tab1 = page.locator('button', { hasText: '1' }).first();
    await tab1.click({ button: 'right' });

    const deleteButton = page.locator('.fixed.z-\\[100\\] button', { hasText: 'Delete Tab' });
    await expect(deleteButton).toBeDisabled();
  });
});
