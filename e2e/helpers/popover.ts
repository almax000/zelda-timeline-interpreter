import { type Page } from '@playwright/test';

/**
 * Click a button inside a toolbar popover that may be outside the viewport.
 * Uses dispatchEvent to bypass Playwright's viewport check.
 */
export async function clickPopoverButton(page: Page, selector: string) {
  await page.locator(selector).dispatchEvent('click');
  await page.waitForTimeout(200);
}

/**
 * Open the shapes popover and select a shape tool.
 */
export async function selectShape(page: Page, shapeTitle: string) {
  await page.locator('[data-testid="toolbar-shapes"]').click();
  await page.waitForTimeout(200);
  await clickPopoverButton(page, `button[title="${shapeTitle}"]`);
}

/**
 * Open the draw popover and activate a pen (first pen button = red).
 */
export async function activatePen(page: Page) {
  await page.locator('[data-testid="toolbar-draw"]').click();
  await page.waitForTimeout(200);
  const penButton = page.locator('button[title="Pen"]').first();
  await penButton.dispatchEvent('click');
  await page.waitForTimeout(200);
}

/**
 * Open the draw popover and activate the eraser.
 */
export async function activateEraser(page: Page) {
  await page.locator('[data-testid="toolbar-draw"]').click();
  await page.waitForTimeout(200);
  await page.locator('button[title="Eraser"]').dispatchEvent('click');
  await page.waitForTimeout(200);
}
