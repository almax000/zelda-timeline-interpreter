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
