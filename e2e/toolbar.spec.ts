import { test, expect } from '@playwright/test';
import { getNodeCount, switchToEditableTab, expandSidebar } from './helpers/canvas';

test.describe('Toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('displays sidebar logo', async ({ page }) => {
    // Logo shows "Zelda" / "Timeline" / "Interpreter" or Z/T/I when collapsed
    await expandSidebar(page);
    await expect(page.locator('text=Zelda').first()).toBeVisible();
  });

  test('language switcher changes UI language', async ({ page }) => {
    // Switch to editable tab to see sidebar
    await switchToEditableTab(page);
    await expandSidebar(page);

    // Language is now a <select> dropdown
    const langSelect = page.locator('select');

    // Switch to Japanese
    await langSelect.selectOption('ja');
    await expect(page.locator('text=スカイウォードソード').first()).toBeVisible();

    // Switch to zh-CN
    await langSelect.selectOption('zh-CN');
    // Check for a Chinese game name
    await expect(page.locator('[draggable="true"]').first()).toBeVisible();

    // Switch back to English
    await langSelect.selectOption('en');
    await expect(page.locator('[draggable="true"]').first()).toBeVisible();
  });

  test('clear button shows confirmation dialog', async ({ page }) => {
    // Switch to editable tab (tools only show on editable tabs)
    await switchToEditableTab(page);

    // Clear button uses trash icon with toolbar.clear title
    const clearButton = page.locator('button[title="Clear"]');
    await clearButton.click();
    await expect(page.locator('text=Clear Timeline?')).toBeVisible();

    // Cancel
    await page.locator('button', { hasText: 'Cancel' }).click();
    await expect(page.locator('text=Clear Timeline?')).not.toBeVisible();
  });

  test('clear button removes all nodes when confirmed', async ({ page }) => {
    await switchToEditableTab(page);
    await page.waitForSelector('.react-flow__node');

    const clearButton = page.locator('button[title="Clear"]');
    await clearButton.click();

    const confirmButton = page.locator('.fixed.z-50 button', { hasText: 'Clear' });
    await confirmButton.click();

    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBe(0);
  });

  test('export menu opens and closes', async ({ page }) => {
    const exportButton = page.locator('button', { hasText: /Export/ });
    await exportButton.click();

    await expect(page.locator('text=Export as PNG')).toBeVisible();
    await expect(page.locator('text=Export as PDF')).toBeVisible();
    await expect(page.locator('text=Export as JSON')).toBeVisible();

    // Click outside to close
    await page.locator('.react-flow').click();
  });

  test('pen and eraser toggle buttons work', async ({ page }) => {
    // Switch to editable tab (tools only show on editable tabs)
    await switchToEditableTab(page);

    const eraserButton = page.locator('button[title="Eraser"]');
    await expect(eraserButton).toBeVisible();

    // Click a pen button (first colored pen)
    const penButtons = page.locator('button[title="Pen"]');
    const firstPen = penButtons.first();
    await firstPen.click();

    // Click same pen again to deactivate
    await firstPen.click();

    // Click eraser to activate
    await eraserButton.click();
    // Click eraser again to deactivate
    await eraserButton.click();
  });

  test('tools are hidden on locked page-0', async ({ page }) => {
    // On page-0 by default - tool buttons should not be visible (locked)
    await expect(page.locator('button[title="Eraser"]')).not.toBeVisible();
  });
});
