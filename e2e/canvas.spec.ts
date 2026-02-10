import { test, expect } from '@playwright/test';
import { getNodeCount, clearLocalStorage, switchToEditableTab, switchToPage0, importFixtureViaUI } from './helpers/canvas';

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
    await page.waitForSelector('.react-flow__node');
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBeGreaterThanOrEqual(30);
  });

  test('shows background dots', async ({ page }) => {
    const background = page.locator('.react-flow__background');
    await expect(background).toBeVisible();
  });

  test('can delete nodes with Delete key on editable tab', async ({ page }) => {
    // Switch to editable canvas-1 and import fixture
    await switchToEditableTab(page);
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__node');

    const initialCount = await getNodeCount(page);
    expect(initialCount).toBe(3);

    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();
    await page.keyboard.press('Delete');

    const newCount = await getNodeCount(page);
    expect(newCount).toBeLessThan(initialCount);
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

  test('shows labelPoint nodes in official timeline', async ({ page }) => {
    await page.waitForSelector('.react-flow__node');
    const labelNodes = page.locator('.react-flow__node-labelPoint');
    const count = await labelNodes.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('page-0 button shows Triforce icon and page 1 shows number', async ({ page }) => {
    // Page-0 uses TriforceIcon SVG (has polygon elements)
    const page0Button = page.locator('button:has(svg polygon)').first();
    await expect(page0Button).toBeVisible();
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

    // Switch back to page 1 (canvas-1 — preloaded with official timeline on first visit)
    await switchToEditableTab(page);
    await page.waitForSelector('.react-flow__node');
    const canvas1NodeCount = await getNodeCount(page);
    expect(canvas1NodeCount).toBeGreaterThanOrEqual(30);
  });

  test('page-0 is locked: tools are hidden', async ({ page }) => {
    // On page-0 by default — locked page hides toolbar tools
    await expect(page.locator('button[title="Eraser"]')).not.toBeVisible();
    await expect(page.locator('button[title="Clear"]')).not.toBeVisible();
  });
});
