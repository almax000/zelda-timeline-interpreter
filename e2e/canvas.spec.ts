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
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBeGreaterThan(0);
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
});
