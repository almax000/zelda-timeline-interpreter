import { test, expect } from '@playwright/test';
import { getNodeCount, getEdgeCount, clearLocalStorage, switchToEditableTab, importFixtureViaUI } from './helpers/canvas';

test.describe('Persistence', () => {
  test('state persists after page reload on editable tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');

    // Switch to editable canvas-1 and import fixture
    await switchToEditableTab(page);
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__node');

    const nodesBefore = await getNodeCount(page);
    const edgesBefore = await getEdgeCount(page);

    // Reload page
    await page.reload();
    await page.waitForSelector('.react-flow');
    // After reload, need to switch to editable tab again since default is page-0
    await switchToEditableTab(page);
    await page.waitForSelector('.react-flow__node');

    const nodesAfter = await getNodeCount(page);
    const edgesAfter = await getEdgeCount(page);

    expect(nodesAfter).toBe(nodesBefore);
    expect(edgesAfter).toBe(edgesBefore);
  });

  test('page-0 loads official timeline after clearing storage', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');

    // Official timeline auto-loads on first visit (no localStorage)
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBeGreaterThan(0);
  });

  test('canvas-1 starts empty on first visit', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');

    // Switch to canvas-1
    await switchToEditableTab(page);
    await page.waitForTimeout(300);

    // canvas-1 starts empty (official timeline cleared)
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBe(0);
  });

  test('new tab persists as empty after reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');

    // Create a new tab
    await page.getByTitle('New canvas').click();
    await page.waitForTimeout(300);

    // New tab should be empty
    const initialCount = await getNodeCount(page);
    expect(initialCount).toBe(0);

    // Reload - need to switch back to the new tab
    await page.reload();
    await page.waitForSelector('.react-flow');
    await page.waitForTimeout(500);

    // The active tab should persist
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBe(0);
  });
});
