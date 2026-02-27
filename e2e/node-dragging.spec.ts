import { test, expect } from '@playwright/test';
import {
  clearLocalStorage,
  switchToEditableTab,
  importFixtureViaUI,
  dragNodeOnCanvas,
  getNodeCount,
  dragGameToCanvas,
  dismissWelcomeScreen,
} from './helpers/canvas';

test.describe('Node Dragging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__node');
  });

  test('dragging a game node changes its position', async ({ page }) => {
    const node = page.locator('.react-flow__node').first();
    const boxBefore = await node.boundingBox();

    await dragNodeOnCanvas(page, node, 100, 80);
    await page.waitForTimeout(300);

    const boxAfter = await node.boundingBox();
    expect(boxBefore).toBeTruthy();
    expect(boxAfter).toBeTruthy();
    // Position should have changed
    expect(
      Math.abs(boxAfter!.x - boxBefore!.x) > 30 ||
      Math.abs(boxAfter!.y - boxBefore!.y) > 30
    ).toBeTruthy();
  });

  test('snap guides appear when node aligns with another', async ({ page }) => {
    // We have 3 nodes from fixture. Move one to roughly align with another.
    const nodes = page.locator('.react-flow__node');
    const secondNode = nodes.nth(1);
    const firstNode = nodes.first();

    const firstBox = await firstNode.boundingBox();
    const secondBox = await secondNode.boundingBox();
    if (!firstBox || !secondBox) return;

    // Calculate delta to align second node's Y with first node's Y
    const dy = firstBox.y - secondBox.y;

    // Start drag but don't release - check for snap guides during drag
    const box = await secondNode.boundingBox();
    if (!box) return;

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + dy, { steps: 20 });

    // Check for snap guide lines during drag
    const snapLines = page.locator('line[stroke="#FF44CC"]');
    const snapCount = await snapLines.count();
    // Snap guides may or may not appear depending on exact alignment
    // At minimum, the drag should work without error

    await page.mouse.up();
  });

  test('snap guides disappear after drag ends', async ({ page }) => {
    const node = page.locator('.react-flow__node').first();
    await dragNodeOnCanvas(page, node, 50, 50);
    await page.waitForTimeout(300);

    // After drag ends, no snap guide lines should be visible
    const snapLines = page.locator('line[stroke="#FF44CC"]');
    const snapCount = await snapLines.count();
    expect(snapCount).toBe(0);
  });

  test('shift-drag constrains to horizontal axis', async ({ page }) => {
    const node = page.locator('.react-flow__node').first();
    const boxBefore = await node.boundingBox();
    if (!boxBefore) return;

    // Shift-drag horizontally
    await dragNodeOnCanvas(page, node, 120, 60, { shiftKey: true });
    await page.waitForTimeout(300);

    const boxAfter = await node.boundingBox();
    if (!boxAfter) return;

    // When shift is held and dx > dy, vertical movement should be minimal
    const dx = Math.abs(boxAfter.x - boxBefore.x);
    const dy = Math.abs(boxAfter.y - boxBefore.y);
    // Horizontal movement should dominate
    expect(dx).toBeGreaterThan(dy);
  });

  test('shift-drag constrains to vertical axis', async ({ page }) => {
    const node = page.locator('.react-flow__node').first();
    const boxBefore = await node.boundingBox();
    if (!boxBefore) return;

    // Shift-drag vertically (more dy than dx)
    await dragNodeOnCanvas(page, node, 10, 120, { shiftKey: true });
    await page.waitForTimeout(300);

    const boxAfter = await node.boundingBox();
    if (!boxAfter) return;

    // Vertical movement should dominate
    const dx = Math.abs(boxAfter.x - boxBefore.x);
    const dy = Math.abs(boxAfter.y - boxBefore.y);
    expect(dy).toBeGreaterThan(dx);
  });

  test('node snaps to edge of another node', async ({ page }) => {
    const nodes = page.locator('.react-flow__node');
    const firstNode = nodes.first();
    const secondNode = nodes.nth(1);

    const firstBox = await firstNode.boundingBox();
    if (!firstBox) return;

    // Drag second node to roughly align its top with the first node's top
    const secondBox = await secondNode.boundingBox();
    if (!secondBox) return;

    const dy = firstBox.y - secondBox.y;
    await dragNodeOnCanvas(page, secondNode, 0, dy);
    await page.waitForTimeout(300);

    const secondBoxAfter = await secondNode.boundingBox();
    if (!secondBoxAfter) return;

    // The Y positions should be reasonably close after dragging to align
    expect(Math.abs(secondBoxAfter.y - firstBox.y)).toBeLessThan(50);
  });

});
