import { test, expect } from '@playwright/test';
import { getNodeCount, clearLocalStorage, switchToEditableTab, switchToPage0 } from './helpers/canvas';

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

    // Click Rectangle tool
    await page.locator('button[title="Rectangle"]').click();

    // Click on canvas to place shape
    const canvas = page.locator('.react-flow__pane');
    await canvas.click({ position: { x: 300, y: 200 } });

    await page.waitForTimeout(300);
    const newCount = await getNodeCount(page);
    expect(newCount).toBe(initialCount + 1);

    // Verify it's a shape node
    const shapeNodes = page.locator('.react-flow__node-shape');
    await expect(shapeNodes.first()).toBeVisible();
  });

  test('can place a circle on canvas', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    await page.locator('button[title="Circle"]').click();

    const canvas = page.locator('.react-flow__pane');
    await canvas.click({ position: { x: 300, y: 200 } });

    await page.waitForTimeout(300);
    const newCount = await getNodeCount(page);
    expect(newCount).toBe(initialCount + 1);
  });

  test('can place an arrow on canvas', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    await page.locator('button[title="Arrow"]').click();

    const canvas = page.locator('.react-flow__pane');
    await canvas.click({ position: { x: 300, y: 200 } });

    await page.waitForTimeout(300);
    const newCount = await getNodeCount(page);
    expect(newCount).toBe(initialCount + 1);
  });

  test('can place a line on canvas', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    await page.locator('button[title="Line"]').click();

    const canvas = page.locator('.react-flow__pane');
    await canvas.click({ position: { x: 300, y: 200 } });

    await page.waitForTimeout(300);
    const newCount = await getNodeCount(page);
    expect(newCount).toBe(initialCount + 1);
  });

  test('shape tool deactivates after placing', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    await page.locator('button[title="Rectangle"]').click();

    // Place shape
    const canvas = page.locator('.react-flow__pane');
    await canvas.click({ position: { x: 300, y: 200 } });
    await page.waitForTimeout(300);

    // Click again — should NOT create another shape (tool resets after placement)
    await canvas.click({ position: { x: 400, y: 300 } });
    await page.waitForTimeout(300);

    const count = await getNodeCount(page);
    expect(count).toBe(initialCount + 1); // Only 1 shape placed
  });

  test('shape tool can be cancelled by clicking same button again', async ({ page }) => {
    // Activate rectangle
    const rectButton = page.locator('button[title="Rectangle"]');
    await rectButton.click();

    // Verify cursor changes to crosshair
    const container = page.locator('.cursor-crosshair');
    await expect(container).toBeVisible();

    // Click again to deactivate
    await rectButton.click();

    // Crosshair cursor should be gone
    await expect(container).not.toBeVisible();
  });

  test('shape tools are hidden on locked page-0', async ({ page }) => {
    await switchToPage0(page);
    await page.waitForTimeout(300);

    // Shape buttons should not be visible on locked page
    await expect(page.locator('button[title="Rectangle"]')).not.toBeVisible();
    await expect(page.locator('button[title="Circle"]')).not.toBeVisible();
  });
});
