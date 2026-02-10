import { test, expect } from '@playwright/test';
import { getNodeCount, clearLocalStorage, switchToEditableTab, importFixtureViaUI } from './helpers/canvas';

test.describe('Undo/Redo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    // Switch to editable tab and import fixture (3 nodes, 2 edges)
    await switchToEditableTab(page);
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__node');
  });

  test('Cmd+Z undoes node deletion', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    // Delete a node
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();
    await page.keyboard.press('Delete');
    await page.waitForTimeout(700); // Wait for temporal throttle

    const afterDeleteCount = await getNodeCount(page);
    expect(afterDeleteCount).toBeLessThan(initialCount);

    // Cmd+Z to undo
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(200);

    const afterUndoCount = await getNodeCount(page);
    expect(afterUndoCount).toBe(initialCount);
  });

  test('Cmd+Shift+Z redoes undone action', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    // Delete a node
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();
    await page.keyboard.press('Delete');
    await page.waitForTimeout(700);

    const afterDeleteCount = await getNodeCount(page);

    // Undo
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(200);

    // Redo
    await page.keyboard.press('Meta+Shift+z');
    await page.waitForTimeout(200);

    const afterRedoCount = await getNodeCount(page);
    expect(afterRedoCount).toBe(afterDeleteCount);
  });
});
