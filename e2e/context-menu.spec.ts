import { test, expect } from '@playwright/test';
import { getNodeCount, clearLocalStorage, switchToEditableTab, importFixtureViaUI } from './helpers/canvas';

test.describe('Context Menu', () => {
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

  test('right-click on node shows context menu with delete option', async ({ page }) => {
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click({ button: 'right' });

    const deleteButton = page.locator('[data-testid="context-menu"] button').first();
    await expect(deleteButton).toBeVisible();
  });

  test('delete from node context menu removes the node', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click({ button: 'right' });

    const deleteButton = page.locator('[data-testid="context-menu"] button').first();
    await deleteButton.click();

    const newCount = await getNodeCount(page);
    expect(newCount).toBe(initialCount - 1);
  });

  test('right-click on edge shows branch type options', async ({ page }) => {
    const edgeInteraction = page.locator('.react-flow__edge-interaction').first();
    if (await edgeInteraction.count() > 0) {
      await edgeInteraction.scrollIntoViewIfNeeded();
      const box = await edgeInteraction.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' });
        const contextMenu = page.locator('[data-testid="context-menu"]');
        await expect(contextMenu).toBeVisible();
      }
    }
  });

  test('context menu closes when clicking elsewhere', async ({ page }) => {
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.scrollIntoViewIfNeeded();
    const box = await firstNode.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' });
    }

    const contextMenu = page.locator('[data-testid="context-menu"]');
    await expect(contextMenu).toBeVisible();

    await page.mouse.click(10, 10);
    await expect(contextMenu).not.toBeVisible();
  });

});
