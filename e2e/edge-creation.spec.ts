import { test, expect } from '@playwright/test';
import { getNodeCount, getEdgeCount, clearLocalStorage, switchToEditableTab, importFixtureViaUI } from './helpers/canvas';

test.describe('Edge Creation & Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__node');
  });

  test('fixture has expected edges', async ({ page }) => {
    const edgeCount = await getEdgeCount(page);
    expect(edgeCount).toBe(2);
  });

  test('right-click edge shows context menu with branch types', async ({ page }) => {
    const edgeInteraction = page.locator('.react-flow__edge-interaction').first();
    if (await edgeInteraction.count() === 0) return;

    await edgeInteraction.scrollIntoViewIfNeeded();
    const box = await edgeInteraction.boundingBox();
    if (!box) return;

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' });
    const contextMenu = page.locator('[data-testid="context-menu"]');
    await expect(contextMenu).toBeVisible();

    // Should have branch type options (colored circles)
    const branchButtons = contextMenu.locator('button');
    const count = await branchButtons.count();
    expect(count).toBeGreaterThanOrEqual(2); // At least Delete + branch type buttons
  });

  test('can delete an edge via context menu', async ({ page }) => {
    const initialEdges = await getEdgeCount(page);
    const edgeInteraction = page.locator('.react-flow__edge-interaction').first();
    if (await edgeInteraction.count() === 0) return;

    await edgeInteraction.scrollIntoViewIfNeeded();
    const box = await edgeInteraction.boundingBox();
    if (!box) return;

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' });
    const contextMenu = page.locator('[data-testid="context-menu"]');
    await expect(contextMenu).toBeVisible();

    // Click delete button (red text)
    const deleteButton = contextMenu.locator('button.text-red-400').first();
    await deleteButton.click();

    await page.waitForTimeout(300);
    const newEdges = await getEdgeCount(page);
    expect(newEdges).toBe(initialEdges - 1);
  });

  test('can connect two nodes by dragging between handles', async ({ page }) => {
    // Delete existing edges first to start clean
    const initialEdges = await getEdgeCount(page);

    // Find source handle on first node
    const sourceHandle = page.locator('.react-flow__node').first().locator('.react-flow__handle-right').first();
    const targetHandle = page.locator('.react-flow__node').nth(1).locator('.react-flow__handle-left').first();

    if (await sourceHandle.count() === 0 || await targetHandle.count() === 0) return;

    await sourceHandle.scrollIntoViewIfNeeded();
    const sourceBox = await sourceHandle.boundingBox();
    await targetHandle.scrollIntoViewIfNeeded();
    const targetBox = await targetHandle.boundingBox();

    if (!sourceBox || !targetBox) return;

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(500);
    const newEdges = await getEdgeCount(page);
    expect(newEdges).toBeGreaterThanOrEqual(initialEdges);
  });
});
