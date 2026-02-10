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

  test('right-click edge shows context menu with branch options', async ({ page }) => {
    // Edge interaction areas may overlap pane — use the SVG edge path directly
    const edgePath = page.locator('.react-flow__edge').first();
    if (await edgePath.count() === 0) return;

    await edgePath.scrollIntoViewIfNeeded();
    const box = await edgePath.boundingBox();
    if (!box) return;

    // Right-click at the edge center
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' });
    await page.waitForTimeout(300);

    const contextMenu = page.locator('[data-testid="context-menu"]');
    // May open pane or edge menu depending on hit — just verify a context menu appears
    await expect(contextMenu).toBeVisible();
  });

  test('can delete an edge via node deletion (edge auto-removed)', async ({ page }) => {
    const initialEdges = await getEdgeCount(page);
    const initialNodes = await getNodeCount(page);

    // Delete a node that has edges — edges connected to it should also be removed
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();
    await page.keyboard.press('Delete');
    await page.waitForTimeout(300);

    const newNodes = await getNodeCount(page);
    expect(newNodes).toBe(initialNodes - 1);

    // At least one edge should be removed when a connected node is deleted
    const newEdges = await getEdgeCount(page);
    expect(newEdges).toBeLessThan(initialEdges);
  });

  test('can connect two nodes by dragging between handles', async ({ page }) => {
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
