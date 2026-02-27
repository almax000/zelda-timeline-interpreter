import { test, expect } from '@playwright/test';
import { getNodeCount, clearLocalStorage, switchToEditableTab, importFixtureViaUI } from './helpers/canvas';

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

  test('can create and switch tabs via PageTabs', async ({ page }) => {
    // Click + to create new tab
    const addButton = page.getByTitle('New canvas');
    await addButton.click();

    // New tab button (index 2) should appear
    await expect(page.locator('button', { hasText: '2' }).first()).toBeVisible();

    // New tab should be empty
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBe(0);
  });

});
