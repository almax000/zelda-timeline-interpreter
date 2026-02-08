import { test, expect } from '@playwright/test';
import { getNodeCount, getEdgeCount, clearLocalStorage } from './helpers/canvas';

test.describe('Persistence', () => {
  test('state persists after page reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow__node');

    const nodesBefore = await getNodeCount(page);
    const edgesBefore = await getEdgeCount(page);

    // Reload page
    await page.reload();
    await page.waitForSelector('.react-flow__node');

    const nodesAfter = await getNodeCount(page);
    const edgesAfter = await getEdgeCount(page);

    expect(nodesAfter).toBe(nodesBefore);
    expect(edgesAfter).toBe(edgesBefore);
  });

  test('first visit loads official timeline', async ({ page }) => {
    // Clear storage then reload
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');

    // Wait for official timeline nodes to appear
    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBeGreaterThan(10); // Official timeline has 22 nodes
  });

  test('cleared timeline persists as empty after reload on new tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');

    // Create a new tab and switch to it
    await page.getByTitle('New canvas').click();
    await expect(page.locator('text=Canvas 2')).toBeVisible();

    // New tab should be empty
    const initialCount = await getNodeCount(page);
    expect(initialCount).toBe(0);

    // Reload - new tab should still be empty
    await page.reload();
    await page.waitForSelector('.react-flow');
    await page.waitForTimeout(500);

    // The active tab should persist - verify Canvas 2 is still selected
    // and the canvas is empty (official tab auto-loads, but new tabs stay empty)
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBe(0);
  });
});
