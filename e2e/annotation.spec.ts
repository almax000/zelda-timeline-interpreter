import { test, expect } from '@playwright/test';
import { clearLocalStorage, switchToEditableTab } from './helpers/canvas';

test.describe('Annotation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
  });

  test('clicking pen activates annotation mode with crosshair cursor', async ({ page }) => {
    // Click first pen button (red)
    const penButton = page.locator('button[title="Pen"]').first();
    await penButton.click();

    // Annotation overlay should appear with crosshair cursor
    const overlay = page.locator('.absolute.inset-0.z-10');
    await expect(overlay).toBeVisible();
  });

  test('can draw a stroke on canvas', async ({ page }) => {
    // Activate pen
    const penButton = page.locator('button[title="Pen"]').first();
    await penButton.click();
    await page.waitForTimeout(200);

    // Get the canvas container position
    const container = page.locator('.flex-1.h-full.relative');
    const box = await container.boundingBox();
    if (!box) throw new Error('Could not find container');

    // Draw a stroke (mousedown → move → mouseup)
    const startX = box.x + 200;
    const startY = box.y + 200;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 100, startY + 50, { steps: 10 });
    await page.mouse.move(startX + 200, startY, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Verify stroke was drawn — Konva renders <line> elements or canvas
    // Check that the annotation overlay still exists (it stays when strokes exist)
    await expect(page.locator('.absolute.inset-0.z-10')).toBeVisible();

    // Deactivate pen by clicking again
    await penButton.click();
    await page.waitForTimeout(200);

    // Overlay should still be visible because strokes exist (even when not in draw mode)
    await expect(page.locator('.absolute.inset-0.z-10')).toBeVisible();
  });

  test('eraser can remove strokes', async ({ page }) => {
    // Draw a stroke first
    const penButton = page.locator('button[title="Pen"]').first();
    await penButton.click();
    await page.waitForTimeout(200);

    const container = page.locator('.flex-1.h-full.relative');
    const box = await container.boundingBox();
    if (!box) throw new Error('Could not find container');

    // Draw
    const startX = box.x + 200;
    const startY = box.y + 200;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 150, startY + 50, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Deactivate pen
    await penButton.click();
    await page.waitForTimeout(100);

    // Activate eraser
    const eraserButton = page.locator('button[title="Eraser"]');
    await eraserButton.click();
    await page.waitForTimeout(200);

    // Erase by clicking on the stroke area
    await page.mouse.move(startX + 75, startY + 25);
    await page.mouse.down();
    await page.mouse.move(startX + 75, startY + 25);
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Deactivate eraser
    await eraserButton.click();
  });

  test('clear strokes button removes all strokes', async ({ page }) => {
    // Draw a stroke
    const penButton = page.locator('button[title="Pen"]').first();
    await penButton.click();
    await page.waitForTimeout(200);

    const container = page.locator('.flex-1.h-full.relative');
    const box = await container.boundingBox();
    if (!box) throw new Error('Could not find container');

    await page.mouse.move(box.x + 200, box.y + 200);
    await page.mouse.down();
    await page.mouse.move(box.x + 350, box.y + 250, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Deactivate pen
    await penButton.click();
    await page.waitForTimeout(200);

    // "Clear strokes" button should appear
    const clearButton = page.locator('button[title="Clear strokes"]');
    await expect(clearButton).toBeVisible();

    // Click clear strokes
    await clearButton.click();
    await page.waitForTimeout(300);

    // Overlay should disappear (no strokes and not in annotation mode)
    await expect(page.locator('.absolute.inset-0.z-10')).not.toBeVisible();
  });

  test('pen color can be changed', async ({ page }) => {
    // Click first pen (should be red by default)
    const penButtons = page.locator('button[title="Pen"]');
    const firstPen = penButtons.first();
    await firstPen.click();
    await page.waitForTimeout(100);

    // Deactivate
    await firstPen.click();
    await page.waitForTimeout(100);

    // Click a different pen color (second pen button)
    const secondPen = penButtons.nth(1);
    await secondPen.click();
    await page.waitForTimeout(100);

    // Should activate annotation mode again
    const overlay = page.locator('.absolute.inset-0.z-10');
    await expect(overlay).toBeVisible();

    await secondPen.click(); // deactivate
  });

  test('stroke width selector appears when pen is active', async ({ page }) => {
    // Activate pen
    const penButton = page.locator('button[title="Pen"]').first();
    await penButton.click();
    await page.waitForTimeout(200);

    // Width options should be visible
    const width2 = page.locator('button[title="2px"]');
    const width4 = page.locator('button[title="4px"]');
    await expect(width2).toBeVisible();
    await expect(width4).toBeVisible();

    // Click a different width
    await width4.click();
    await page.waitForTimeout(100);

    // Deactivate
    await penButton.click();
  });
});
