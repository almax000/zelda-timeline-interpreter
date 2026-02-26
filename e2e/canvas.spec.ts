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

  test('page-0 loads the official timeline preset', async ({ page }) => {
    // Official timeline auto-loads on first visit (no localStorage)
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBeGreaterThan(0);
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
  });

  test('page-0 is locked: toolbar shows lock button with disabled controls', async ({ page }) => {
    // On page-0 by default — lock button should be visible
    const lockButton = page.locator('[data-testid="toolbar-lock"]');
    await expect(lockButton).toBeVisible();

    // Select button should exist but be in disabled container
    // Button → Tooltip wrapper (relative) → disabled container (opacity-40)
    const selectButton = page.locator('[data-testid="toolbar-select"]');
    const disabledContainer = selectButton.locator('../..');
    await expect(disabledContainer).toHaveClass(/opacity-40/);
  });
});
