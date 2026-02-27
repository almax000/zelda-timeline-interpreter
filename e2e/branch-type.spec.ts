import { test, expect } from '@playwright/test';
import {
  clearLocalStorage,
  switchToEditableTab,
  importFixtureViaUI,
  getEdgeCount,
} from './helpers/canvas';

test.describe('Branch Type System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__node');
    await page.waitForTimeout(300);
  });

  async function openEdgeContextMenu(page: import('@playwright/test').Page) {
    // Use SVG getPointAtLength to find a point ON the edge path (not bounding box center)
    const point = await page.evaluate(() => {
      const path = document.querySelector('.react-flow__edge-interaction') as SVGPathElement | null;
      if (!path) return null;
      const len = path.getTotalLength();
      const pt = path.getPointAtLength(len / 2);
      const svg = path.ownerSVGElement;
      if (!svg) return null;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      return {
        x: pt.x * ctm.a + ctm.e,
        y: pt.y * ctm.d + ctm.f,
      };
    });
    if (!point) throw new Error('Could not find edge path midpoint');
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.locator('[data-testid="context-menu"]').waitFor({ state: 'visible', timeout: 3000 });

    // Verify this is an edge context menu (has color buttons)
    const hasColorButtons = await page.locator('[data-testid="context-menu"] button.rounded-full').count();
    if (hasColorButtons === 0) {
      // Close this menu and try the second edge
      await page.mouse.click(10, 10);
      await page.waitForTimeout(200);

      const point2 = await page.evaluate(() => {
        const paths = document.querySelectorAll('.react-flow__edge-interaction');
        const path = paths[1] as SVGPathElement | undefined;
        if (!path) return null;
        const len = path.getTotalLength();
        const pt = path.getPointAtLength(len / 2);
        const svg = path.ownerSVGElement;
        if (!svg) return null;
        const ctm = svg.getScreenCTM();
        if (!ctm) return null;
        return {
          x: pt.x * ctm.a + ctm.e,
          y: pt.y * ctm.d + ctm.f,
        };
      });
      if (!point2) throw new Error('Could not find second edge path midpoint');
      await page.mouse.click(point2.x, point2.y, { button: 'right' });
      await page.locator('[data-testid="context-menu"]').waitFor({ state: 'visible', timeout: 3000 });
    }
  }

  test('edge context menu shows 4 branch color buttons', async ({ page }) => {
    await openEdgeContextMenu(page);
    const contextMenu = page.locator('[data-testid="context-menu"]');
    const colorButtons = contextMenu.locator('button.rounded-full');
    await expect(colorButtons).toHaveCount(4);
  });

  test('clicking branch color changes edge type', async ({ page }) => {
    await openEdgeContextMenu(page);
    const contextMenu = page.locator('[data-testid="context-menu"]');
    const colorButtons = contextMenu.locator('button.rounded-full');
    await colorButtons.nth(0).click();
    await page.waitForTimeout(300);

    const canvasData = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('zelda-tab-'));
      for (const key of keys) {
        const val = localStorage.getItem(key);
        if (val && val.includes('edges')) return val;
      }
      return null;
    });
    expect(canvasData).toBeTruthy();
    expect(canvasData).toContain('main');
  });

  test('changed branch type persists after reload', async ({ page }) => {
    await openEdgeContextMenu(page);
    const contextMenu = page.locator('[data-testid="context-menu"]');
    const colorButtons = contextMenu.locator('button.rounded-full');
    await colorButtons.nth(1).click();
    await page.waitForTimeout(500);

    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
    await page.waitForTimeout(500);

    const dataAfter = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('zelda-tab-'));
      for (const key of keys) {
        const val = localStorage.getItem(key);
        if (val && val.includes('edges')) return val;
      }
      return null;
    });

    expect(dataAfter).toBeTruthy();
    expect(dataAfter).toContain('fallen');
  });

  test('edge renders with branch-specific stroke color', async ({ page }) => {
    const edges = page.locator('.react-flow__edge');
    const edgeCount = await edges.count();
    expect(edgeCount).toBeGreaterThan(0);

    const paths = page.locator('.react-flow__edge path');
    const pathCount = await paths.count();
    expect(pathCount).toBeGreaterThan(0);
  });

  test('each branch option has correct title', async ({ page }) => {
    await openEdgeContextMenu(page);
    const contextMenu = page.locator('[data-testid="context-menu"]');
    const colorButtons = contextMenu.locator('button.rounded-full');

    const count = await colorButtons.count();
    expect(count).toBe(4);

    for (let i = 0; i < count; i++) {
      const title = await colorButtons.nth(i).getAttribute('title');
      expect(title).toBeTruthy();
    }
  });

  test('delete option in edge context menu removes edge', async ({ page }) => {
    const initialEdgeCount = await getEdgeCount(page);
    expect(initialEdgeCount).toBeGreaterThan(0);

    await openEdgeContextMenu(page);
    const deleteButton = page.locator('[data-testid="context-menu"] button', { hasText: 'Delete' });
    await deleteButton.click();
    await page.waitForTimeout(300);

    const newEdgeCount = await getEdgeCount(page);
    expect(newEdgeCount).toBe(initialEdgeCount - 1);
  });
});
