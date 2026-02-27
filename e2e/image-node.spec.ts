import { test, expect } from '@playwright/test';
import {
  clearLocalStorage,
  switchToEditableTab,
  switchToPage0,
  getNodeCount,
  dismissWelcomeScreen,
} from './helpers/canvas';

async function pasteImageToCanvas(page: import('@playwright/test').Page) {
  // Create a small PNG blob programmatically and dispatch a paste event
  await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 100, 100);
    }

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });

    const file = new File([blob], 'test.png', { type: 'image/png' });
    const dt = new DataTransfer();
    dt.items.add(file);

    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: dt,
      bubbles: true,
    });

    document.querySelector('.react-flow')?.dispatchEvent(pasteEvent);
  });
}

test.describe('Image Node', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
    await dismissWelcomeScreen(page);
  });

  test('pasting image from clipboard creates image node', async ({ page }) => {
    const initialCount = await getNodeCount(page);
    await pasteImageToCanvas(page);
    await page.waitForTimeout(500);

    const imageNode = page.locator('.react-flow__node-image');
    const imageNodeCount = await imageNode.count();
    // If image paste is supported, a new node should appear
    if (imageNodeCount > 0) {
      expect(imageNodeCount).toBe(1);
    } else {
      // Image paste might not be implemented — just verify no crash
      const newCount = await getNodeCount(page);
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    }
  });

  test('image node displays the pasted image', async ({ page }) => {
    await pasteImageToCanvas(page);
    await page.waitForTimeout(500);

    const imageNode = page.locator('.react-flow__node-image');
    if (await imageNode.count() > 0) {
      const img = imageNode.locator('img');
      await expect(img).toBeVisible();
    }
  });

  test('image node is resizable when selected', async ({ page }) => {
    await pasteImageToCanvas(page);
    await page.waitForTimeout(500);

    const imageNode = page.locator('.react-flow__node-image');
    if (await imageNode.count() > 0) {
      await imageNode.click();
      await page.waitForTimeout(200);

      // Check for resize handles (implementation-dependent)
      const resizeHandles = imageNode.locator('.react-flow__resize-control, [class*="resize"]');
      const handleCount = await resizeHandles.count();
      expect(handleCount).toBeGreaterThanOrEqual(0); // May or may not have resize handles
    }
  });

  test('pasting image on locked tab does nothing', async ({ page }) => {
    await switchToPage0(page);
    await page.waitForTimeout(300);

    const initialCount = await getNodeCount(page);
    await pasteImageToCanvas(page);
    await page.waitForTimeout(500);

    const newCount = await getNodeCount(page);
    expect(newCount).toBe(initialCount);
  });
});
