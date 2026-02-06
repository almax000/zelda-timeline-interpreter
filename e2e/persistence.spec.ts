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

  test('cleared timeline persists as empty after reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');

    // Clear timeline
    await page.locator('button', { hasText: 'Clear' }).click();
    await page.locator('button', { hasText: /^Clear$/ }).last().click();

    await page.waitForTimeout(500);

    // Reload
    await page.reload();
    await page.waitForSelector('.react-flow');
    await page.waitForTimeout(500);

    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBe(0);
  });
});
