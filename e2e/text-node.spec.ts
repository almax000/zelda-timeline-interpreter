import { test, expect } from '@playwright/test';
import { switchToEditableTab, getNodeCount } from './helpers/canvas';

test.describe('TextNode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
  });

  test('text tool + click creates textLabel node', async ({ page }) => {
    const initialCount = await getNodeCount(page);

    // Activate text tool
    await page.locator('[data-testid="toolbar-text"]').click();
    await page.waitForTimeout(200);

    // Click on canvas to place text node
    const canvas = page.locator('.react-flow');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    expect(await getNodeCount(page)).toBe(initialCount + 1);
  });

  test('double-click text node enters edit mode', async ({ page }) => {
    // Create text node
    await page.locator('[data-testid="toolbar-text"]').click();
    await page.waitForTimeout(200);
    const canvas = page.locator('.react-flow');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    // Double-click to edit
    const textNode = page.locator('.react-flow__node').last();
    await textNode.dblclick();
    await page.waitForTimeout(300);

    // Textarea should appear
    const textarea = textNode.locator('textarea');
    await expect(textarea).toBeVisible();
  });

  test('typing updates node content', async ({ page }) => {
    // Create text node
    await page.locator('[data-testid="toolbar-text"]').click();
    await page.waitForTimeout(200);
    const canvas = page.locator('.react-flow');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    // Double-click to edit
    const textNode = page.locator('.react-flow__node').last();
    await textNode.dblclick();
    await page.waitForTimeout(300);

    // Type text
    await page.keyboard.type('Hello World');
    await page.waitForTimeout(200);

    const textarea = textNode.locator('textarea');
    await expect(textarea).toHaveValue('Hello World');
  });

  test('Escape exits editing', async ({ page }) => {
    // Create text node
    await page.locator('[data-testid="toolbar-text"]').click();
    await page.waitForTimeout(200);
    const canvas = page.locator('.react-flow');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    // Double-click to edit
    const textNode = page.locator('.react-flow__node').last();
    await textNode.dblclick();
    await page.waitForTimeout(300);

    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Textarea should disappear
    const textarea = textNode.locator('textarea');
    await expect(textarea).toHaveCount(0);
  });

  test('sub-toolbar appears when editing text node', async ({ page }) => {
    // Create text node
    await page.locator('[data-testid="toolbar-text"]').click();
    await page.waitForTimeout(200);
    const canvas = page.locator('.react-flow');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    // Sub-toolbar should NOT be visible yet
    await expect(page.locator('[data-subtoolbar]')).toHaveCount(0);

    // Double-click to edit
    const textNode = page.locator('.react-flow__node').last();
    await textNode.dblclick();
    await page.waitForTimeout(300);

    // Sub-toolbar should appear
    await expect(page.locator('[data-subtoolbar]')).toBeVisible();
  });

  test('sub-toolbar disappears on exit editing', async ({ page }) => {
    // Create and edit text node
    await page.locator('[data-testid="toolbar-text"]').click();
    await page.waitForTimeout(200);
    const canvas = page.locator('.react-flow');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    const textNode = page.locator('.react-flow__node').last();
    await textNode.dblclick();
    await page.waitForTimeout(300);
    await expect(page.locator('[data-subtoolbar]')).toBeVisible();

    // Exit editing
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(page.locator('[data-subtoolbar]')).toHaveCount(0);
  });

  test('clicking sub-toolbar button does NOT exit edit mode (blur regression)', async ({ page }) => {
    // Create text node
    await page.locator('[data-testid="toolbar-text"]').click();
    await page.waitForTimeout(200);
    const canvas = page.locator('.react-flow');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    // Enter edit mode
    const textNode = page.locator('.react-flow__node').last();
    await textNode.dblclick();
    await page.waitForTimeout(300);

    // Click bold button in sub-toolbar
    const boldButton = page.locator('[data-subtoolbar] button').filter({ hasText: 'B' });
    await boldButton.click();
    await page.waitForTimeout(300);

    // Should still be in edit mode (textarea visible)
    const textarea = textNode.locator('textarea');
    await expect(textarea).toBeVisible();
  });

  test('font size change works via sub-toolbar', async ({ page }) => {
    // Create and edit text node
    await page.locator('[data-testid="toolbar-text"]').click();
    await page.waitForTimeout(200);
    const canvas = page.locator('.react-flow');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    const textNode = page.locator('.react-flow__node').last();
    await textNode.dblclick();
    await page.waitForTimeout(300);

    // Change font size via select dropdown
    const fontSizeSelect = page.locator('[data-subtoolbar] select');
    await fontSizeSelect.selectOption('24');
    await page.waitForTimeout(300);

    // Font size should have changed (verify via select value)
    await expect(fontSizeSelect).toHaveValue('24');
  });

  test('bold toggle works', async ({ page }) => {
    // Create and edit text node
    await page.locator('[data-testid="toolbar-text"]').click();
    await page.waitForTimeout(200);
    const canvas = page.locator('.react-flow');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    const textNode = page.locator('.react-flow__node').last();
    await textNode.dblclick();
    await page.waitForTimeout(300);

    // Click bold button
    const boldButton = page.locator('[data-subtoolbar] button').filter({ hasText: 'B' }).first();
    await boldButton.click();
    await page.waitForTimeout(300);

    // Bold button should now be active
    await expect(boldButton).toHaveClass(/bg-\[var\(--color-gold\)\]/);
  });

  test('undo reverts text changes via import', async ({ page }) => {
    // Import a fixture to have baseline nodes
    const exportButton = page.locator('button', { hasText: /Export/ });
    await exportButton.click();

    const { fileURLToPath } = await import('url');
    const pathMod = await import('path');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = pathMod.dirname(__filename);
    const testFile = pathMod.join(__dirname, 'fixtures', 'test-timeline.json');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFile);
    await page.waitForTimeout(500);
    await page.waitForSelector('.react-flow__node');

    const initialCount = await getNodeCount(page);
    expect(initialCount).toBe(3);

    // Delete a node via context menu
    const node = page.locator('.react-flow__node').first();
    await node.click({ button: 'right' });
    await page.waitForTimeout(300);
    const deleteButton = page.getByRole('button', { name: 'Delete' });
    await deleteButton.click();
    await page.waitForTimeout(1000);

    expect(await getNodeCount(page)).toBeLessThan(initialCount);

    // Undo
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(1000);

    expect(await getNodeCount(page)).toBe(initialCount);
  });
});
