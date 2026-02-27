import { test, expect } from '@playwright/test';
import {
  clearLocalStorage,
  switchToPage0,
  switchToEditableTab,
  getNodeCount,
} from './helpers/canvas';

test.describe('Tab Duplication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
  });

  test('page-0 context menu shows Duplicate to Edit', async ({ page }) => {
    const page0Button = page.locator('button:has(svg polygon)').first();
    await page0Button.click({ button: 'right' });

    const duplicateButton = page.locator('.fixed.z-\\[100\\] button', { hasText: 'Duplicate to Edit' });
    await expect(duplicateButton).toBeVisible();
  });

  test('Duplicate to Edit creates new tab with content', async ({ page }) => {
    const page0Button = page.locator('button:has(svg polygon)').first();
    await page0Button.click({ button: 'right' });

    const duplicateButton = page.locator('.fixed.z-\\[100\\] button', { hasText: 'Duplicate to Edit' });
    await duplicateButton.click();
    await page.waitForTimeout(500);

    // A new tab should appear (tab "2" since "1" already exists)
    const tab2 = page.locator('button', { hasText: '2' }).first();
    await expect(tab2).toBeVisible();

    // The new tab should have nodes from the official timeline
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBeGreaterThan(0);
  });

  test('duplicated tab has same node count as page-0', async ({ page }) => {
    // Get page-0 node count
    await switchToPage0(page);
    const page0Count = await getNodeCount(page);

    // Duplicate page-0
    const page0Button = page.locator('button:has(svg polygon)').first();
    await page0Button.click({ button: 'right' });
    const duplicateButton = page.locator('.fixed.z-\\[100\\] button', { hasText: 'Duplicate to Edit' });
    await duplicateButton.click();
    await page.waitForTimeout(500);

    const dupCount = await getNodeCount(page);
    expect(dupCount).toBe(page0Count);
  });

  test('duplicated tab is editable (not locked)', async ({ page }) => {
    const page0Button = page.locator('button:has(svg polygon)').first();
    await page0Button.click({ button: 'right' });
    const duplicateButton = page.locator('.fixed.z-\\[100\\] button', { hasText: 'Duplicate to Edit' });
    await duplicateButton.click();
    await page.waitForTimeout(500);

    // Toolbar select button should NOT be in disabled container (no opacity-40)
    const selectButton = page.locator('[data-testid="toolbar-select"]');
    const disabledContainer = selectButton.locator('../..');
    await expect(disabledContainer).not.toHaveClass(/opacity-40/);
  });

  test('modifying duplicated tab does not affect page-0', async ({ page }) => {
    // Get initial page-0 count
    await switchToPage0(page);
    const page0Count = await getNodeCount(page);

    // Duplicate page-0
    const page0Button = page.locator('button:has(svg polygon)').first();
    await page0Button.click({ button: 'right' });
    const duplicateButton = page.locator('.fixed.z-\\[100\\] button', { hasText: 'Duplicate to Edit' });
    await duplicateButton.click();
    await page.waitForTimeout(500);

    // Delete a node on the duplicated tab
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();
    await page.keyboard.press('Delete');
    await page.waitForTimeout(300);

    const dupCount = await getNodeCount(page);
    expect(dupCount).toBeLessThan(page0Count);

    // Switch back to page-0 and verify unchanged
    await switchToPage0(page);
    const page0CountAfter = await getNodeCount(page);
    expect(page0CountAfter).toBe(page0Count);
  });
});
