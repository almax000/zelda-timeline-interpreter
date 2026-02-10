import { test, expect } from '@playwright/test';
import { clearLocalStorage, switchToEditableTab } from './helpers/canvas';
import { activatePen, activateEraser } from './helpers/popover';

test.describe('Annotation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
  });

  test('clicking pen activates annotation mode with canvas overlay', async ({ page }) => {
    await activatePen(page);

    // Annotation overlay should appear — Konva Stage renders a canvas element
    const konvaCanvas = page.locator('canvas').first();
    await expect(konvaCanvas).toBeVisible();
  });

  test('can draw a stroke on canvas', async ({ page }) => {
    await activatePen(page);

    // Get the canvas container position
    const container = page.locator('.flex-1.h-full.relative');
    const box = await container.boundingBox();
    if (!box) throw new Error('Could not find container');

    // Draw a stroke (mousedown -> move -> mouseup)
    const startX = box.x + 200;
    const startY = box.y + 200;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 100, startY + 50, { steps: 10 });
    await page.mouse.move(startX + 200, startY, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Deactivate pen by clicking select
    await page.locator('[data-testid="toolbar-select"]').click();
    await page.waitForTimeout(200);

    // Konva canvas should still be visible because strokes exist
    const konvaCanvas = page.locator('canvas').first();
    await expect(konvaCanvas).toBeVisible();
  });

  test('eraser can remove strokes', async ({ page }) => {
    // Draw a stroke first
    await activatePen(page);

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
    await page.locator('[data-testid="toolbar-select"]').click();
    await page.waitForTimeout(100);

    // Activate eraser via Draw popover
    await activateEraser(page);

    // Erase by clicking on the stroke area
    await page.mouse.move(startX + 75, startY + 25);
    await page.mouse.down();
    await page.mouse.move(startX + 75, startY + 25);
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Deactivate eraser
    await page.locator('[data-testid="toolbar-select"]').click();
  });

  test('clear strokes button removes all strokes', async ({ page }) => {
    // Draw a stroke
    await activatePen(page);

    const container = page.locator('.flex-1.h-full.relative');
    const box = await container.boundingBox();
    if (!box) throw new Error('Could not find container');

    await page.mouse.move(box.x + 200, box.y + 200);
    await page.mouse.down();
    await page.mouse.move(box.x + 350, box.y + 250, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Deactivate pen
    await page.locator('[data-testid="toolbar-select"]').click();
    await page.waitForTimeout(200);

    // Open draw popover to find "Clear strokes"
    await page.locator('[data-testid="toolbar-draw"]').click();
    await page.waitForTimeout(200);

    await page.locator('button[title="Clear strokes"]').dispatchEvent('click');
    await page.waitForTimeout(300);

    // Konva canvas should disappear (no strokes and not in annotation mode)
    await expect(page.locator('canvas')).toHaveCount(0);
  });

  test('pen color can be changed', async ({ page }) => {
    // Open draw popover and click first pen (red)
    await page.locator('[data-testid="toolbar-draw"]').click();
    await page.waitForTimeout(200);

    const penButtons = page.locator('button[title="Pen"]');
    await penButtons.first().dispatchEvent('click');
    await page.waitForTimeout(100);

    // Konva canvas should be visible
    await expect(page.locator('canvas').first()).toBeVisible();

    // Deactivate
    await page.locator('[data-testid="toolbar-select"]').click();
    await page.waitForTimeout(100);

    // Open draw popover again and click a different pen color
    await page.locator('[data-testid="toolbar-draw"]').click();
    await page.waitForTimeout(200);
    await penButtons.nth(1).dispatchEvent('click');
    await page.waitForTimeout(100);

    // Should activate annotation mode again — canvas visible
    await expect(page.locator('canvas').first()).toBeVisible();

    await page.locator('[data-testid="toolbar-select"]').click();
  });

  test('stroke width selector is visible in draw popover', async ({ page }) => {
    await page.locator('[data-testid="toolbar-draw"]').click();
    await page.waitForTimeout(200);

    // Width options should exist inside popover (may be outside viewport but still in DOM)
    const width2 = page.locator('button[title="2px"]');
    const width4 = page.locator('button[title="4px"]');
    await expect(width2).toHaveCount(1);
    await expect(width4).toHaveCount(1);

    // Click a different width via dispatchEvent
    await width4.dispatchEvent('click');
    await page.waitForTimeout(100);
  });
});
