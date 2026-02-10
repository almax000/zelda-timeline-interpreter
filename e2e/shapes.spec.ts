import { test, expect } from '@playwright/test';
import { getNodeCount, clearLocalStorage, switchToEditableTab, switchToPage0 } from './helpers/canvas';
import { selectShape } from './helpers/popover';

test.describe('Shape Tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
  });

  test('can place a rectangle on canvas', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    await selectShape(page, 'Rectangle');

    const canvas = page.locator('.react-flow__pane');
    await canvas.click({ position: { x: 300, y: 200 } });

    await page.waitForTimeout(300);
    const newCount = await getNodeCount(page);
    expect(newCount).toBe(initialCount + 1);

    const shapeNodes = page.locator('.react-flow__node-shape');
    await expect(shapeNodes.first()).toBeVisible();
  });

  test('can place a circle on canvas', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    await selectShape(page, 'Circle');

    const canvas = page.locator('.react-flow__pane');
    await canvas.click({ position: { x: 300, y: 200 } });

    await page.waitForTimeout(300);
    const newCount = await getNodeCount(page);
    expect(newCount).toBe(initialCount + 1);
  });

  test('can place an arrow on canvas', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    await selectShape(page, 'Arrow');

    const canvas = page.locator('.react-flow__pane');
    await canvas.click({ position: { x: 300, y: 200 } });

    await page.waitForTimeout(300);
    const newCount = await getNodeCount(page);
    expect(newCount).toBe(initialCount + 1);
  });

  test('can place a line on canvas', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    await selectShape(page, 'Line');

    const canvas = page.locator('.react-flow__pane');
    await canvas.click({ position: { x: 300, y: 200 } });

    await page.waitForTimeout(300);
    const newCount = await getNodeCount(page);
    expect(newCount).toBe(initialCount + 1);
  });

  test('shape tool deactivates after placing', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    await selectShape(page, 'Rectangle');

    const canvas = page.locator('.react-flow__pane');
    await canvas.click({ position: { x: 300, y: 200 } });
    await page.waitForTimeout(300);

    // Click again — should NOT create another shape (tool resets after placement)
    await canvas.click({ position: { x: 400, y: 300 } });
    await page.waitForTimeout(300);

    const count = await getNodeCount(page);
    expect(count).toBe(initialCount + 1); // Only 1 shape placed
  });

  test('shape tool activates crosshair cursor', async ({ page }) => {
    await selectShape(page, 'Rectangle');

    // Verify cursor changes to crosshair
    const container = page.locator('.cursor-crosshair');
    await expect(container).toBeVisible();
  });

  test('shapes popover is disabled on locked page-0', async ({ page }) => {
    await switchToPage0(page);
    await page.waitForTimeout(300);

    // Select button should be inside disabled container (opacity-40)
    const selectButton = page.locator('[data-testid="toolbar-select"]');
    const parentDiv = selectButton.locator('..');
    await expect(parentDiv).toHaveClass(/opacity-40/);
  });
});
