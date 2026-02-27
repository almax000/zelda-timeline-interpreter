import { test, expect } from '@playwright/test';
import { clearLocalStorage, switchToEditableTab, dismissWelcomeScreen } from './helpers/canvas';

function parseScale(transform: string | null): number {
  if (!transform) return 1;
  const match = transform.match(/scale\(([^)]+)\)/);
  return match ? parseFloat(match[1]) : 1;
}

test.describe('Zoom', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
    await dismissWelcomeScreen(page);
  });

  test('mouse wheel zooms the canvas', async ({ page }) => {
    const viewport = page.locator('.react-flow__viewport');
    const transformBefore = await viewport.getAttribute('style');
    const scaleBefore = parseScale(transformBefore);

    const canvas = page.locator('.react-flow');
    const box = await canvas.boundingBox();
    if (!box) return;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -300); // Negative = zoom in
    await page.waitForTimeout(500);

    const transformAfter = await viewport.getAttribute('style');
    const scaleAfter = parseScale(transformAfter);

    // Scale should have changed
    expect(scaleAfter).not.toBeCloseTo(scaleBefore, 1);
  });

  test('Cmd+= zooms in and Cmd+- zooms out', async ({ page }) => {
    const viewport = page.locator('.react-flow__viewport');
    const transformBefore = await viewport.getAttribute('style');
    const scaleBefore = parseScale(transformBefore);

    // Zoom in with wheel
    const canvas = page.locator('.react-flow');
    const box = await canvas.boundingBox();
    if (!box) return;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -500); // Zoom in
    await page.waitForTimeout(500);

    const transformZoomedIn = await viewport.getAttribute('style');
    const scaleZoomedIn = parseScale(transformZoomedIn);
    expect(scaleZoomedIn).toBeGreaterThan(scaleBefore);

    // Zoom out with wheel
    await page.mouse.wheel(0, 500); // Zoom out
    await page.waitForTimeout(500);

    const transformZoomedOut = await viewport.getAttribute('style');
    const scaleZoomedOut = parseScale(transformZoomedOut);
    expect(scaleZoomedOut).toBeLessThan(scaleZoomedIn);
  });
});
