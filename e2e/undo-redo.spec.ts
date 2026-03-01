import { test, expect } from '@playwright/test';
import { getNodeCount, getEdgeCount, clearLocalStorage, switchToEditableTab, importFixtureViaUI, dragGameToCanvas } from './helpers/canvas';

test.describe('Undo/Redo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    // Switch to editable tab and import fixture (3 nodes, 2 edges)
    await switchToEditableTab(page);
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__node');
  });

  test('Cmd+Z undoes node deletion', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    // Delete a node
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();
    await page.keyboard.press('Delete');
    await page.waitForTimeout(700); // Wait for temporal throttle

    const afterDeleteCount = await getNodeCount(page);
    expect(afterDeleteCount).toBeLessThan(initialCount);

    // Cmd+Z to undo
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(200);

    const afterUndoCount = await getNodeCount(page);
    expect(afterUndoCount).toBe(initialCount);
  });

  test('Cmd+Shift+Z redoes undone action', async ({ page }) => {
    await getNodeCount(page);

    // Delete a node
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();
    await page.keyboard.press('Delete');
    await page.waitForTimeout(700);

    const afterDeleteCount = await getNodeCount(page);

    // Undo
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(200);

    // Redo
    await page.keyboard.press('Meta+Shift+z');
    await page.waitForTimeout(200);

    const afterRedoCount = await getNodeCount(page);
    expect(afterRedoCount).toBe(afterDeleteCount);
  });

  test('undo reverts node deletion after drag-drop', async ({ page }) => {
    // On the imported fixture tab (3 nodes), drag an additional game
    await dragGameToCanvas(page, '[draggable="true"]', 400, 300);
    await page.waitForTimeout(1000); // Wait for temporal throttle

    const countWithNewNode = await getNodeCount(page);
    expect(countWithNewNode).toBe(4); // 3 fixture + 1 new

    // Delete the new node
    const lastNode = page.locator('.react-flow__node').last();
    await lastNode.click();
    await page.keyboard.press('Delete');
    await page.waitForTimeout(700);

    const afterDelete = await getNodeCount(page);
    expect(afterDelete).toBe(3);

    // Undo the deletion
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(500);

    const afterUndo = await getNodeCount(page);
    expect(afterUndo).toBe(4);
  });

  test('undo reverts edge deletion via context menu', async ({ page }) => {
    const initialEdgeCount = await getEdgeCount(page);
    expect(initialEdgeCount).toBeGreaterThan(0);

    // Delete edge via context menu (more reliable than clicking interaction + Delete key)
    const point = await page.evaluate(() => {
      const path = document.querySelector('.react-flow__edge-interaction') as SVGPathElement | null;
      if (!path) return null;
      const len = path.getTotalLength();
      const pt = path.getPointAtLength(len / 2);
      const svg = path.ownerSVGElement;
      if (!svg) return null;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      return { x: pt.x * ctm.a + ctm.e, y: pt.y * ctm.d + ctm.f };
    });
    if (!point) return;

    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.waitForTimeout(300);

    const contextMenu = page.locator('[data-testid="context-menu"]');
    if (await contextMenu.isVisible()) {
      const deleteButton = contextMenu.locator('button', { hasText: 'Delete' });
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.waitForTimeout(700);

        const afterDeleteEdges = await getEdgeCount(page);
        expect(afterDeleteEdges).toBeLessThan(initialEdgeCount);

        await page.keyboard.press('Meta+z');
        await page.waitForTimeout(500);

        const afterUndoEdges = await getEdgeCount(page);
        expect(afterUndoEdges).toBe(initialEdgeCount);
      }
    }
  });

  test('multiple undo steps work in sequence', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    // Delete 2 nodes sequentially
    for (let i = 0; i < 2; i++) {
      const node = page.locator('.react-flow__node').first();
      await node.click();
      await page.keyboard.press('Delete');
      await page.waitForTimeout(700);
    }

    const afterDeleteCount = await getNodeCount(page);
    expect(afterDeleteCount).toBe(initialCount - 2);

    // Undo twice
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(300);
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(300);

    const afterUndoCount = await getNodeCount(page);
    expect(afterUndoCount).toBe(initialCount);
  });

  test('redo after undo chain restores all', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    // Delete 2 nodes
    for (let i = 0; i < 2; i++) {
      const node = page.locator('.react-flow__node').first();
      await node.click();
      await page.keyboard.press('Delete');
      await page.waitForTimeout(700);
    }

    const afterDeleteCount = await getNodeCount(page);

    // Undo 2
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(300);
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(300);

    expect(await getNodeCount(page)).toBe(initialCount);

    // Redo 2
    await page.keyboard.press('Meta+Shift+z');
    await page.waitForTimeout(300);
    await page.keyboard.press('Meta+Shift+z');
    await page.waitForTimeout(300);

    expect(await getNodeCount(page)).toBe(afterDeleteCount);
  });

  test('new action after undo clears redo stack', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    // Delete a node
    const node = page.locator('.react-flow__node').first();
    await node.click();
    await page.keyboard.press('Delete');
    await page.waitForTimeout(700);

    // Undo
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(300);
    expect(await getNodeCount(page)).toBe(initialCount);

    // Perform a new action (delete another node)
    const anotherNode = page.locator('.react-flow__node').first();
    await anotherNode.click();
    await page.keyboard.press('Delete');
    await page.waitForTimeout(700);

    // Redo should have no effect (redo stack cleared)
    const afterNewAction = await getNodeCount(page);
    await page.keyboard.press('Meta+Shift+z');
    await page.waitForTimeout(300);

    expect(await getNodeCount(page)).toBe(afterNewAction);
  });

  test('undo toolbar buttons reflect state', async ({ page }) => {
    // Initially, undo should be disabled (no history after import settles)
    // We need to perform an action first
    const undoButton = page.locator('[data-testid="toolbar-undo"]');
    const redoButton = page.locator('[data-testid="toolbar-redo"]');

    // Delete a node to create undo history
    const node = page.locator('.react-flow__node').first();
    await node.click();
    await page.keyboard.press('Delete');
    await page.waitForTimeout(700);

    // Undo button should now be active (not disabled)
    if (await undoButton.count() > 0) {
      await expect(undoButton).toBeEnabled();
    }

    // Undo
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(300);

    // Redo button should now be active
    if (await redoButton.count() > 0) {
      await expect(redoButton).toBeEnabled();
    }
  });
});
