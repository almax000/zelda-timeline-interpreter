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
 * Activate the standalone eraser button.
 */
export async function activateEraser(page: Page) {
  await page.locator('[data-testid="toolbar-eraser"]').dispatchEvent('click');
  await page.waitForTimeout(200);
}
