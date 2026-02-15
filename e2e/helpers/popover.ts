import { type Page } from '@playwright/test';

/**
 * Activate the pen tool by clicking the draw button directly (no popover).
 */
export async function activatePen(page: Page) {
  await page.locator('[data-testid="toolbar-draw"]').click();
  await page.waitForTimeout(200);
}

/**
 * Activate the standalone eraser button.
 */
export async function activateEraser(page: Page) {
  await page.locator('[data-testid="toolbar-eraser"]').dispatchEvent('click');
  await page.waitForTimeout(200);
}
