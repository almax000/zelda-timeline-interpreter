import { test, expect } from '@playwright/test';
import {
  clearLocalStorage,
  switchToEditableTab,
  getNodeCount,
  getEdgeCount,
  waitForWelcomeScreen,
  dragGameToCanvas,
} from './helpers/canvas';

test.describe('Welcome Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
  });

  test('welcome screen appears on empty editable tab', async ({ page }) => {
    await switchToEditableTab(page);
    await waitForWelcomeScreen(page);
    await expect(page.getByText('Build Your Timeline Theory')).toBeVisible();
  });

  test('shows Load Official and Start Blank buttons', async ({ page }) => {
    await switchToEditableTab(page);
    await waitForWelcomeScreen(page);
    await expect(page.getByText('Load Official Timeline')).toBeVisible();
    await expect(page.getByText('Start Blank')).toBeVisible();
  });

  test('Start Blank dismisses welcome screen', async ({ page }) => {
    await switchToEditableTab(page);
    await waitForWelcomeScreen(page);

    await page.getByText('Start Blank').click();
    await page.waitForTimeout(300);

    await expect(page.getByText('Build Your Timeline Theory')).not.toBeVisible();
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBe(0);
  });

  test('Load Official populates canvas', async ({ page }) => {
    await switchToEditableTab(page);
    await waitForWelcomeScreen(page);

    await page.getByText('Load Official Timeline').click();
    await page.waitForTimeout(500);

    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBeGreaterThan(0);
    const edgeCount = await getEdgeCount(page);
    expect(edgeCount).toBeGreaterThan(0);
  });

  test('welcome screen disappears on pane click', async ({ page }) => {
    await switchToEditableTab(page);
    await waitForWelcomeScreen(page);

    // Click on the canvas pane (outside the welcome screen buttons)
    const pane = page.locator('.react-flow__pane');
    await pane.click({ position: { x: 50, y: 50 } });
    await page.waitForTimeout(500);

    await expect(page.getByText('Build Your Timeline Theory')).not.toBeVisible();
  });

  test('welcome screen disappears on drag-drop', async ({ page }) => {
    await switchToEditableTab(page);
    await waitForWelcomeScreen(page);

    // Drag a game card onto the canvas (use edge coordinates to avoid the centered welcome overlay)
    await dragGameToCanvas(page, '[draggable="true"]', 100, 50);
    await page.waitForTimeout(500);

    await expect(page.getByText('Build Your Timeline Theory')).not.toBeVisible();
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBe(1);
  });
});
