import { test, expect } from '@playwright/test';
import { switchToEditableTab, getNodeCount, getEdgeCount } from './helpers/canvas';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importHorizontalFixture(page: import('@playwright/test').Page) {
  const exportButton = page.locator('button', { hasText: /Export/ });
  await exportButton.click();

  const testFile = path.join(__dirname, 'fixtures', 'horizontal-edge.json');
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testFile);
  await page.waitForTimeout(500);
}

test.describe('EventNode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
  });

  test('event point handles are invisible', async ({ page }) => {
    // Place an event node via the annotate tool on the pane
    await page.locator('[data-testid="toolbar-annotate"]').click();
    await page.waitForTimeout(200);

    const container = page.locator('.react-flow');
    const box = await container.boundingBox();
    if (!box) throw new Error('Could not find canvas');

    // Click on the pane to place an event point
    await page.mouse.click(box.x + 300, box.y + 300);
    await page.waitForTimeout(500);

    // Verify event node was created
    const eventNode = page.locator('.react-flow__node-event');
    await expect(eventNode.first()).toBeVisible();

    // Hover over the event node
    const nodeBBox = await eventNode.first().boundingBox();
    if (!nodeBBox) throw new Error('Could not find event node');
    await page.mouse.move(nodeBBox.x + nodeBBox.width / 2, nodeBBox.y + nodeBBox.height / 2);
    await page.waitForTimeout(300);

    // All handles should have zero dimensions (invisible)
    const handles = eventNode.first().locator('.react-flow__handle');
    const handleCount = await handles.count();
    expect(handleCount).toBe(8); // 4 target + 4 source

    for (let i = 0; i < handleCount; i++) {
      const handle = handles.nth(i);
      const bbox = await handle.boundingBox();
      // Handles with !w-0 !h-0 should have ~0 size
      if (bbox) {
        expect(bbox.width).toBeLessThanOrEqual(1);
        expect(bbox.height).toBeLessThanOrEqual(1);
      }
    }
  });

  test('edge click splits edge into two', async ({ page }) => {
    await importHorizontalFixture(page);

    // Verify initial state: 2 nodes, 1 edge
    expect(await getNodeCount(page)).toBe(2);
    expect(await getEdgeCount(page)).toBe(1);

    // Activate annotate tool
    await page.locator('[data-testid="toolbar-annotate"]').click();
    await page.waitForTimeout(200);

    // Click on the edge to split it
    const edge = page.locator('.react-flow__edge').first();
    await edge.scrollIntoViewIfNeeded();
    const edgeBBox = await edge.boundingBox();
    if (!edgeBBox) throw new Error('Could not find edge');

    await page.mouse.click(
      edgeBBox.x + edgeBBox.width / 2,
      edgeBBox.y + edgeBBox.height / 2
    );
    await page.waitForTimeout(500);

    // Should now have 3 nodes (2 game + 1 event) and 2 edges
    expect(await getNodeCount(page)).toBe(3);
    expect(await getEdgeCount(page)).toBe(2);
  });

  test('split event node sits on edge line', async ({ page }) => {
    await importHorizontalFixture(page);

    // Activate annotate tool and click on the edge
    await page.locator('[data-testid="toolbar-annotate"]').click();
    await page.waitForTimeout(200);

    const edge = page.locator('.react-flow__edge').first();
    await edge.scrollIntoViewIfNeeded();
    const edgeBBox = await edge.boundingBox();
    if (!edgeBBox) throw new Error('Could not find edge');

    await page.mouse.click(
      edgeBBox.x + edgeBBox.width / 2,
      edgeBBox.y + edgeBBox.height / 2
    );
    await page.waitForTimeout(500);

    // Both game nodes have the same Y (200), so the event node Y should be close
    const gameNodes = page.locator('.react-flow__node-game');
    const eventNode = page.locator('.react-flow__node-event');

    const gameBBox = await gameNodes.first().boundingBox();
    const eventBBox = await eventNode.first().boundingBox();
    if (!gameBBox || !eventBBox) throw new Error('Could not find nodes');

    // Event node center Y should be roughly aligned with game nodes
    const eventCenterY = eventBBox.y + eventBBox.height / 2;
    const gameCenterY = gameBBox.y + gameBBox.height / 2;
    // Allow some tolerance (game nodes have variable height due to cover images)
    expect(Math.abs(eventCenterY - gameCenterY)).toBeLessThan(80);
  });

  test('event node connects as both source and target', async ({ page }) => {
    await importHorizontalFixture(page);

    // Split the edge
    await page.locator('[data-testid="toolbar-annotate"]').click();
    await page.waitForTimeout(200);

    const edge = page.locator('.react-flow__edge').first();
    await edge.scrollIntoViewIfNeeded();
    const edgeBBox = await edge.boundingBox();
    if (!edgeBBox) throw new Error('Could not find edge');

    await page.mouse.click(
      edgeBBox.x + edgeBBox.width / 2,
      edgeBBox.y + edgeBBox.height / 2
    );
    await page.waitForTimeout(500);

    // After split: 2 edges should exist
    const edges = page.locator('.react-flow__edge');
    expect(await edges.count()).toBe(2);

    // The event node should exist
    const eventNode = page.locator('.react-flow__node-event');
    expect(await eventNode.count()).toBe(1);
  });

  test('smooth dragging without grid snap', async ({ page }) => {
    // Place an event node
    await page.locator('[data-testid="toolbar-annotate"]').click();
    await page.waitForTimeout(200);

    const container = page.locator('.react-flow');
    const box = await container.boundingBox();
    if (!box) throw new Error('Could not find canvas');

    await page.mouse.click(box.x + 300, box.y + 300);
    await page.waitForTimeout(500);

    // Switch back to select tool
    await page.locator('[data-testid="toolbar-select"]').click();
    await page.waitForTimeout(200);

    // Get the event node position before drag
    const eventNode = page.locator('.react-flow__node-event').first();
    await expect(eventNode).toBeVisible();

    const beforeBox = await eventNode.boundingBox();
    if (!beforeBox) throw new Error('Could not find event node');

    // Drag by a non-grid-aligned amount (e.g., 13px)
    const startX = beforeBox.x + beforeBox.width / 2;
    const startY = beforeBox.y + beforeBox.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 13, startY + 7, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const afterBox = await eventNode.boundingBox();
    if (!afterBox) throw new Error('Could not find event node after drag');

    // The node should have moved by approximately the drag amount
    const dx = Math.round(afterBox.x - beforeBox.x);
    const dy = Math.round(afterBox.y - beforeBox.y);

    // Without snap grid, position should NOT be snapped to 20px multiples
    // At least one axis should have a non-multiple-of-20 offset
    const isSnapped = dx % 20 === 0 && dy % 20 === 0;
    expect(isSnapped).toBe(false);
  });
});
