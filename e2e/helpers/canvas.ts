import { type Page, type Locator } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Switch to the first tab (or Nth tab) by clicking the numbered page button.
 * `pageIndex` is the 1-based index of the tab in the PageTabs.
 */
export async function switchToEditableTab(page: Page, pageIndex = 1) {
  const pageButton = page.locator(`button:has-text("${pageIndex}")`).first();
  await pageButton.click();
  await page.waitForTimeout(300);
}

/**
 * No-op kept for backward compatibility with existing tests.
 * Sidebar is now always expanded.
 */
export async function expandSidebar() {
  // Sidebar no longer collapses — nothing to do
}

/**
 * Activate a tool by pressing its keyboard shortcut key.
 */
export async function activateToolByKey(page: Page, key: string) {
  await page.keyboard.press(key);
  await page.waitForTimeout(200);
}

/**
 * Import the test fixture (3 nodes, 2 edges) via the Export menu's file input.
 * After import, switches to the editable tab so nodes are visible.
 */
export async function importFixtureViaUI(page: Page) {
  // Open export menu
  const exportButton = page.locator('button', { hasText: /Export/ });
  await exportButton.click();

  // Use the hidden file input to load the fixture
  const testFile = path.join(__dirname, '..', 'fixtures', 'test-timeline.json');
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testFile);

  await page.waitForTimeout(500);
}

/**
 * Dismiss the WelcomeScreen by clicking "Start Blank" if it's visible.
 * Sets onboarding complete BEFORE clicking so the overlay never renders.
 */
export async function dismissWelcomeScreen(page: Page) {
  // Pre-set onboarding complete so tooltips don't appear after welcome dismiss
  await skipOnboarding(page);

  const startBlank = page.getByText('Start Blank');
  if (await startBlank.isVisible({ timeout: 1000 }).catch(() => false)) {
    await startBlank.click();
    await page.waitForTimeout(300);
  }
}

/**
 * Mark onboarding tooltips as complete in localStorage.
 * Prevents onboarding overlay from intercepting pointer events during tests.
 */
export async function skipOnboarding(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('zelda-onboarding-complete', 'true');
    localStorage.setItem(
      'zelda-onboarding-complete-dismissed',
      JSON.stringify(['sidebar', 'toolbar', 'tabs', 'share', 'canvas']),
    );
  });
}

/**
 * Wait for the WelcomeScreen to appear (looks for the title text).
 */
export async function waitForWelcomeScreen(page: Page) {
  await page.getByText('Build Your Timeline Theory').waitFor({ state: 'visible', timeout: 5000 });
}

/**
 * Get a React Flow node locator by its node type and optional index.
 */
export function getNodeByType(page: Page, type: string, index = 0): Locator {
  return page.locator(`.react-flow__node-${type}`).nth(index);
}

/**
 * Read a localStorage item via page.evaluate.
 */
export async function getLocalStorageItem(page: Page, key: string): Promise<string | null> {
  return page.evaluate((k) => localStorage.getItem(k), key);
}

/**
 * Wait for a snap guide line to appear (magenta stroke used by snap guides overlay).
 */
export async function waitForSnapGuide(page: Page) {
  await page.locator('line[stroke="#FF44CC"]').first().waitFor({ state: 'visible', timeout: 3000 });
}

/**
 * Drag a node on the canvas by a specified delta.
 * Supports optional shift key for axis-constrained dragging.
 */
export async function dragNodeOnCanvas(
  page: Page,
  locator: Locator,
  dx: number,
  dy: number,
  options?: { shiftKey?: boolean }
) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Node not found for dragging');

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();

  if (options?.shiftKey) {
    await page.keyboard.down('Shift');
  }

  await page.mouse.move(startX + dx, startY + dy, { steps: 15 });
  await page.mouse.up();

  if (options?.shiftKey) {
    await page.keyboard.up('Shift');
  }
}
