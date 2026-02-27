import { test, expect } from '@playwright/test';
import { clearLocalStorage, switchToEditableTab, getNodeCount, importFixtureViaUI } from './helpers/canvas';

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

    // Verify tab is locked — tools should be disabled (opacity-40)
    // Button → Tooltip wrapper (relative) → disabled container (opacity-40)
    await switchToEditableTab(page);
    await page.waitForTimeout(300);
    const selectButton = page.locator('[data-testid="toolbar-select"]');
    const disabledContainer = selectButton.locator('../..');
    await expect(disabledContainer).toHaveClass(/opacity-40/);

    // Unlock: right-click tab again
    const tabButton2 = page.locator('button', { hasText: '1' }).first();
    await tabButton2.click({ button: 'right' });

    const unlockButton = page.locator('.fixed.z-\\[100\\] button', { hasText: 'Unlock Tab' });
    await unlockButton.click();

    // Tools should be enabled again
    await switchToEditableTab(page);
    await page.waitForTimeout(300);
    await expect(disabledContainer).not.toHaveClass(/opacity-40/);
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

    // Tab button's title attribute should reflect the new name
    await page.waitForTimeout(300);
    await expect(page.locator('button[title="My Timeline"]')).toBeVisible();
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

    // Tab 1 should be gone; verify remaining tab is still visible
    await page.waitForTimeout(300);
    const remainingTab = page.locator('.flex.items-center.gap-1 button').first();
    await expect(remainingTab).toBeVisible();
  });

  test('delete is disabled when only one editable tab remains', async ({ page }) => {
    // Only canvas-1 exists as editable
    const tab1 = page.locator('button', { hasText: '1' }).first();
    await tab1.click({ button: 'right' });

    const deleteButton = page.locator('.fixed.z-\\[100\\] button', { hasText: 'Delete Tab' });
    await expect(deleteButton).toBeDisabled();
  });
});
