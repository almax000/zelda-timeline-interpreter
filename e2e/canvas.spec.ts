import { test, expect } from '@playwright/test';
import { getNodeCount, getEdgeCount, clearLocalStorage } from './helpers/canvas';

test.describe('Canvas - Timeline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
  });

  test('renders the React Flow canvas', async ({ page }) => {
    const canvas = page.locator('.react-flow');
    await expect(canvas).toBeVisible();
  });

  test('loads official timeline on first visit', async ({ page }) => {
    // On first visit (no localStorage), official timeline should be loaded
    // 21 games + 5 era markers + 4 guide nodes = 30 total
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBeGreaterThan(20);
  });

  test('shows controls and background', async ({ page }) => {
    const controls = page.locator('.react-flow__controls');
    await expect(controls).toBeVisible();

    const background = page.locator('.react-flow__background');
    await expect(background).toBeVisible();
  });

  test('can delete nodes with Delete key', async ({ page }) => {
    const initialCount = await getNodeCount(page);
    if (initialCount === 0) return;

    // Click a node to select it
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();

    // Press Delete
    await page.keyboard.press('Delete');

    const newCount = await getNodeCount(page);
    expect(newCount).toBeLessThan(initialCount);
  });

  test('shows minimap by default', async ({ page }) => {
    const minimap = page.locator('.react-flow__minimap');
    await expect(minimap).toBeVisible();
  });

  test('shows era marker nodes in official timeline', async ({ page }) => {
    // Check that event-type nodes (era markers) are present
    await page.waitForSelector('.react-flow__node');
    const eventNodes = page.locator('.react-flow__node-event');
    const count = await eventNodes.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('shows guide nodes in official timeline', async ({ page }) => {
    await page.waitForSelector('.react-flow__node');
    const guideNodes = page.locator('.react-flow__node-guide');
    const count = await guideNodes.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('tab is visible with Canvas 1 tab', async ({ page }) => {
    await expect(page.locator('text=Canvas 1')).toBeVisible();
  });

  test('can create and switch tabs', async ({ page }) => {
    // Click + to create new tab
    const addButton = page.getByTitle('New canvas');
    await addButton.click();

    // New tab should appear
    await expect(page.locator('text=Canvas 2')).toBeVisible();

    // New tab should be empty
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBe(0);

    // Switch back to Canvas 1 tab
    await page.locator('text=Canvas 1').click();
    const canvas1NodeCount = await getNodeCount(page);
    expect(canvas1NodeCount).toBeGreaterThan(20);
  });
});
