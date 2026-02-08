import { test, expect } from '@playwright/test';
import { getNodeCount, clearLocalStorage, switchToEditableTab } from './helpers/canvas';

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

  test('page-0 loads official timeline by default', async ({ page }) => {
    // Page 0 (default) shows official timeline: 21 games + 5 era markers + 4 guides = 30
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBeGreaterThan(20);
  });

  test('shows controls and background', async ({ page }) => {
    const controls = page.locator('.react-flow__controls');
    await expect(controls).toBeVisible();

    const background = page.locator('.react-flow__background');
    await expect(background).toBeVisible();
  });

  test('can delete nodes with Delete key on editable tab', async ({ page }) => {
    // Switch to editable canvas-1
    await switchToEditableTab(page);
    await page.waitForSelector('.react-flow__node');

    const initialCount = await getNodeCount(page);
    if (initialCount === 0) return;

    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();
    await page.keyboard.press('Delete');

    const newCount = await getNodeCount(page);
    expect(newCount).toBeLessThan(initialCount);
  });

  test('shows minimap by default', async ({ page }) => {
    const minimap = page.locator('.react-flow__minimap');
    await expect(minimap).toBeVisible();
  });

  test('shows era marker nodes in official timeline', async ({ page }) => {
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

  test('page-0 button shows ▲ and page 1 shows number', async ({ page }) => {
    // Page tabs are on the right side
    await expect(page.locator('button', { hasText: '▲' })).toBeVisible();
    await expect(page.locator('button', { hasText: '1' }).first()).toBeVisible();
  });

  test('can create and switch tabs via PageTabs', async ({ page }) => {
    // Click + to create new tab
    const addButton = page.getByTitle('New canvas');
    await addButton.click();

    // New tab button (index 2) should appear
    await expect(page.locator('button', { hasText: '2' }).first()).toBeVisible();

    // New tab should be empty
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBe(0);

    // Switch back to page 1 (canvas-1 with official timeline)
    await switchToEditableTab(page);
    const canvas1NodeCount = await getNodeCount(page);
    expect(canvas1NodeCount).toBeGreaterThan(20);
  });

  test('page-0 is read-only: nodes cannot be deleted', async ({ page }) => {
    // On page-0 by default
    await page.waitForSelector('.react-flow__node');

    const initialCount = await getNodeCount(page);
    // Use force:true because elementsSelectable=false makes pane intercept clicks
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click({ force: true });
    await page.keyboard.press('Delete');

    // Count should not change (read-only)
    const newCount = await getNodeCount(page);
    expect(newCount).toBe(initialCount);
  });
});
