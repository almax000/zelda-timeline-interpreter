import { type Page } from '@playwright/test';

export async function dragGameToCanvas(
  page: Page,
  gameCardSelector: string,
  targetX: number,
  targetY: number
) {
  const card = page.locator(gameCardSelector).first();
  const canvas = page.locator('.react-flow');

  const cardBox = await card.boundingBox();
  const canvasBox = await canvas.boundingBox();

  if (!cardBox || !canvasBox) throw new Error('Could not find card or canvas');

  await page.mouse.move(
    cardBox.x + cardBox.width / 2,
    cardBox.y + cardBox.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(
    canvasBox.x + targetX,
    canvasBox.y + targetY,
    { steps: 10 }
  );
  await page.mouse.up();
}

export async function getNodeCount(page: Page): Promise<number> {
  return page.locator('.react-flow__node').count();
}

export async function getEdgeCount(page: Page): Promise<number> {
  return page.locator('.react-flow__edge').count();
}

export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * Switch to an editable canvas tab by clicking the numbered page button.
 * Page-0 is the Triforce icon button, page 1 = "1", etc.
 * `pageIndex` is the 1-based index of the editable tab in the PageTabs.
 */
export async function switchToEditableTab(page: Page, pageIndex = 1) {
  const pageButton = page.locator(`button:has-text("${pageIndex}")`).first();
  await pageButton.click();
  await page.waitForTimeout(300);
}

/**
 * Switch to page-0 by clicking the Triforce icon button (first button in PageTabs).
 */
export async function switchToPage0(page: Page) {
  // Page-0 uses TriforceIcon SVG, it's the first button with an SVG containing polygons
  const page0Button = page.locator('button:has(svg polygon)').first();
  await page0Button.click();
  await page.waitForTimeout(300);
}

/**
 * No-op kept for backward compatibility with existing tests.
 * Sidebar is now always expanded.
 */
export async function expandSidebar(_page: Page) {
  // Sidebar no longer collapses — nothing to do
}
