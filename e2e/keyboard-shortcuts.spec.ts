import { test, expect } from '@playwright/test';
import { switchToEditableTab, importFixtureViaUI, getNodeCount, activateToolByKey, dismissWelcomeScreen } from './helpers/canvas';

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
    await dismissWelcomeScreen(page);
  });

  test('V key activates select tool', async ({ page }) => {
    // First switch to another tool
    await page.locator('[data-testid="toolbar-annotate"]').click();
    await page.waitForTimeout(200);

    await activateToolByKey(page, 'v');
    const selectButton = page.locator('[data-testid="toolbar-select"]');
    await expect(selectButton).toHaveClass(/bg-\[var\(--color-gold\)\]/);
  });

  test('D key activates annotate (event point) mode', async ({ page }) => {
    await activateToolByKey(page, 'd');
    const annotateButton = page.locator('[data-testid="toolbar-annotate"]');
    await expect(annotateButton).toHaveClass(/bg-\[var\(--color-gold\)\]/);
  });

  test('B key activates split (event box) mode', async ({ page }) => {
    await activateToolByKey(page, 'b');
    const splitButton = page.locator('[data-testid="toolbar-split"]');
    await expect(splitButton).toHaveClass(/bg-\[var\(--color-gold\)\]/);
  });

  test('T key activates text placement mode', async ({ page }) => {
    await activateToolByKey(page, 't');
    const textButton = page.locator('[data-testid="toolbar-text"]');
    await expect(textButton).toHaveClass(/bg-\[var\(--color-gold\)\]/);
  });

  test('P key activates pen mode', async ({ page }) => {
    await activateToolByKey(page, 'p');
    const drawButton = page.locator('[data-testid="toolbar-draw"]');
    await expect(drawButton).toHaveClass(/bg-\[var\(--color-gold\)\]/);
  });

  test('E key activates eraser mode', async ({ page }) => {
    await activateToolByKey(page, 'e');
    const eraserButton = page.locator('[data-testid="toolbar-eraser"]');
    await expect(eraserButton).toHaveClass(/bg-\[var\(--color-gold\)\]/);
  });

  test('L key activates laser mode', async ({ page }) => {
    await activateToolByKey(page, 'l');
    const laserButton = page.locator('[data-testid="toolbar-laser"]');
    await expect(laserButton).toHaveClass(/bg-\[var\(--color-gold\)\]/);
  });

  test('Escape returns to select tool', async ({ page }) => {
    await activateToolByKey(page, 'p');
    await page.waitForTimeout(100);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    const selectButton = page.locator('[data-testid="toolbar-select"]');
    await expect(selectButton).toHaveClass(/bg-\[var\(--color-gold\)\]/);
  });

  test('single-key shortcuts do not fire when text node is being edited', async ({ page }) => {
    // Create a text node
    await page.locator('[data-testid="toolbar-text"]').click();
    await page.waitForTimeout(200);
    const canvas = page.locator('.react-flow');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    // Double-click to edit (enters text editing mode — editingTextNodeId is set)
    const textNode = page.locator('.react-flow__node').last();
    await textNode.dblclick();
    await page.waitForTimeout(300);

    // Type 'p' while editing text (should type in textarea, NOT activate pen)
    await page.keyboard.press('p');
    await page.waitForTimeout(200);

    // Textarea should contain 'p'
    const textarea = textNode.locator('textarea');
    await expect(textarea).toHaveValue('p');

    // Pen should NOT be active
    const drawButton = page.locator('[data-testid="toolbar-draw"]');
    await expect(drawButton).not.toHaveClass(/bg-\[var\(--color-gold\)\]/);

    // Exit editing
    await page.keyboard.press('Escape');
  });

  test('Cmd+Z triggers undo', async ({ page }) => {
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__node');

    const initialCount = await getNodeCount(page);
    expect(initialCount).toBeGreaterThan(0);

    // Delete a node via context menu
    const node = page.locator('.react-flow__node').first();
    await node.click({ button: 'right' });
    await page.waitForTimeout(300);

    const deleteButton = page.getByRole('button', { name: 'Delete' });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.waitForTimeout(700); // temporal throttle

      const afterDelete = await getNodeCount(page);
      expect(afterDelete).toBeLessThan(initialCount);

      // Undo
      await page.keyboard.press('Meta+z');
      await page.waitForTimeout(700);

      const afterUndo = await getNodeCount(page);
      expect(afterUndo).toBe(initialCount);
    }
  });

  test('Cmd+Shift+Z triggers redo', async ({ page }) => {
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__node');

    const initialCount = await getNodeCount(page);

    // Delete a node
    const node = page.locator('.react-flow__node').first();
    await node.click({ button: 'right' });
    await page.waitForTimeout(300);
    const deleteButton = page.getByRole('button', { name: 'Delete' });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.waitForTimeout(700);

      // Undo
      await page.keyboard.press('Meta+z');
      await page.waitForTimeout(700);
      expect(await getNodeCount(page)).toBe(initialCount);

      // Redo
      await page.keyboard.press('Meta+Shift+z');
      await page.waitForTimeout(700);
      expect(await getNodeCount(page)).toBeLessThan(initialCount);
    }
  });

  test('Cmd+Y triggers redo', async ({ page }) => {
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__node');

    const initialCount = await getNodeCount(page);

    // Delete a node
    const node = page.locator('.react-flow__node').first();
    await node.click({ button: 'right' });
    await page.waitForTimeout(300);
    const deleteButton = page.getByRole('button', { name: 'Delete' });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.waitForTimeout(700);

      // Undo
      await page.keyboard.press('Meta+z');
      await page.waitForTimeout(700);
      expect(await getNodeCount(page)).toBe(initialCount);

      // Redo with Cmd+Y
      await page.keyboard.press('Meta+y');
      await page.waitForTimeout(700);
      expect(await getNodeCount(page)).toBeLessThan(initialCount);
    }
  });

  test('shortcuts disabled on locked tab', async ({ page }) => {
    // Lock the tab
    await page.locator('[data-testid="toolbar-lock"]').click();
    await page.waitForTimeout(200);

    // Try pressing 'p' for pen
    await page.keyboard.press('p');
    await page.waitForTimeout(200);

    // Draw button should NOT be active
    const drawButton = page.locator('[data-testid="toolbar-draw"]');
    await expect(drawButton).not.toHaveClass(/bg-\[var\(--color-gold\)\]/);

    // Unlock
    await page.locator('[data-testid="toolbar-lock"]').click();
  });
});
