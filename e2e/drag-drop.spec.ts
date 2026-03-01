import { test, expect } from '@playwright/test';
import { getNodeCount, clearLocalStorage, switchToEditableTab, dismissWelcomeScreen } from './helpers/canvas';

test.describe('Drag & Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
  });

  test('can drag a game card from sidebar to canvas', async ({ page }) => {
    await switchToEditableTab(page);

    const initialCount = await getNodeCount(page);
    const firstCard = page.locator('[draggable="true"]').first();
    const canvas = page.locator('.react-flow');

    const cardBox = await firstCard.boundingBox();
    const canvasBox = await canvas.boundingBox();
    if (!cardBox || !canvasBox) throw new Error('Could not find card or canvas');

    await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 300, canvasBox.y + 200, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(500);
    const newCount = await getNodeCount(page);
    expect(newCount).toBe(initialCount + 1);
  });

  test('dropped node appears as a game node', async ({ page }) => {
    await switchToEditableTab(page);

    const firstCard = page.locator('[draggable="true"]').first();
    const canvas = page.locator('.react-flow');

    const cardBox = await firstCard.boundingBox();
    const canvasBox = await canvas.boundingBox();
    if (!cardBox || !canvasBox) throw new Error('Could not find card or canvas');

    await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 300, canvasBox.y + 200, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(500);
    const gameNodes = page.locator('.react-flow__node-game');
    const count = await gameNodes.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('can drag multiple different games to canvas', async ({ page }) => {
    await switchToEditableTab(page);
    await dismissWelcomeScreen(page);

    const canvas = page.locator('.react-flow');
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error('Could not find canvas');

    // Drag first card
    const firstCard = page.locator('[draggable="true"]').nth(0);
    const firstBox = await firstCard.boundingBox();
    if (!firstBox) throw new Error('Could not find first card');

    await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 200, canvasBox.y + 150, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Drag second card
    const secondCard = page.locator('[draggable="true"]').nth(1);
    const secondBox = await secondCard.boundingBox();
    if (!secondBox) throw new Error('Could not find second card');

    await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 400, canvasBox.y + 150, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const count = await getNodeCount(page);
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
