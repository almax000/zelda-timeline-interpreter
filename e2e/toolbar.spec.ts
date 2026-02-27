import { test, expect } from '@playwright/test';
import { getNodeCount, switchToEditableTab, expandSidebar, importFixtureViaUI } from './helpers/canvas';

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

    // Language is now a globe icon popover
    const globeButton = page.locator('button[title="English"]');
    await globeButton.click();

    // Switch to Japanese
    await page.locator('button', { hasText: '日本語' }).click();

    // Check for a Japanese game name via card titles
    await page.waitForTimeout(500);
    const firstCard = page.locator('[draggable="true"]').first();
    await expect(firstCard).toBeVisible();

    // Switch back: open globe (now titled in Japanese)
    const globeButtonJa = page.locator('button[title="日本語"]');
    await globeButtonJa.click();
    await page.locator('button', { hasText: 'English' }).click();

    await page.waitForTimeout(500);
    await expect(page.locator('[draggable="true"]').first()).toBeVisible();
  });

  test('clear button shows confirmation dialog', async ({ page }) => {
    await switchToEditableTab(page);

    const clearButton = page.locator('[data-testid="toolbar-clear"]');
    await clearButton.click();
    await expect(page.locator('text=Clear Timeline?')).toBeVisible();

    // Cancel
    await page.locator('.fixed.z-50 button', { hasText: 'Cancel' }).click();
    await expect(page.locator('text=Clear Timeline?')).not.toBeVisible();
  });

  test('clear button removes all nodes when confirmed', async ({ page }) => {
    await switchToEditableTab(page);
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__node');

    const clearButton = page.locator('[data-testid="toolbar-clear"]');
    await clearButton.click();

    const confirmButton = page.locator('.fixed.z-50 button', { hasText: 'Clear' });
    await confirmButton.click();

    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBe(0);
  });

  test('export menu opens and closes', async ({ page }) => {
    const exportButton = page.locator('button', { hasText: /Export/ });
    await exportButton.click();

    await expect(page.getByRole('button', { name: 'Export as PNG' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export as PDF' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export as JSON' })).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');
  });

  test('lock button toggles lock state', async ({ page }) => {
    await switchToEditableTab(page);

    const lockButton = page.locator('[data-testid="toolbar-lock"]');
    await expect(lockButton).toBeVisible();

    // Lock the tab
    await lockButton.click();
    await page.waitForTimeout(200);

    // Button → Tooltip wrapper (relative) → disabled container (opacity-40)
    const selectButton = page.locator('[data-testid="toolbar-select"]');
    const disabledContainer = selectButton.locator('../..');
    await expect(disabledContainer).toHaveClass(/opacity-40/);

    // Unlock the tab
    await lockButton.click();
    await page.waitForTimeout(200);

    // Buttons should be enabled again
    await expect(disabledContainer).not.toHaveClass(/opacity-40/);
  });

  test('annotate button activates annotate mode', async ({ page }) => {
    await switchToEditableTab(page);

    const annotateButton = page.locator('[data-testid="toolbar-annotate"]');
    await expect(annotateButton).toBeVisible();
    await annotateButton.click();

    // Canvas should have diamond cursor for annotate mode
    const canvasContainer = page.locator('.flex-1.h-full.relative');
    await expect(canvasContainer).toHaveClass(/cursor-diamond/);

    // Click select to deactivate
    await page.locator('[data-testid="toolbar-select"]').click();
    await expect(canvasContainer).not.toHaveClass(/cursor-diamond/);
  });

  test('split button activates split placement mode', async ({ page }) => {
    await switchToEditableTab(page);

    const splitButton = page.locator('[data-testid="toolbar-split"]');
    await expect(splitButton).toBeVisible();
    await splitButton.click();

    // Canvas should have split cursor
    const canvasContainer = page.locator('.flex-1.h-full.relative');
    await expect(canvasContainer).toHaveClass(/cursor-split/);

    // Click select to deactivate
    await page.locator('[data-testid="toolbar-select"]').click();
    await expect(canvasContainer).not.toHaveClass(/cursor-split/);
  });

  test('text button activates text placement mode', async ({ page }) => {
    await switchToEditableTab(page);

    const textButton = page.locator('[data-testid="toolbar-text"]');
    await expect(textButton).toBeVisible();
    await textButton.click();

    // Canvas should have crosshair cursor
    const canvasContainer = page.locator('.flex-1.h-full.relative');
    await expect(canvasContainer).toHaveClass(/cursor-crosshair/);

    // Click select to deactivate
    await page.locator('[data-testid="toolbar-select"]').click();
    await expect(canvasContainer).not.toHaveClass(/cursor-crosshair/);
  });

  test('draw button activates pen and shows sub-toolbar', async ({ page }) => {
    await switchToEditableTab(page);

    const drawButton = page.locator('[data-testid="toolbar-draw"]');
    await drawButton.click();
    await page.waitForTimeout(200);

    // Sub-toolbar should appear with pen colors and widths
    const subToolbar = page.locator('[data-subtoolbar]');
    await expect(subToolbar).toBeVisible();

    // Pen buttons should be visible inside the sub-toolbar
    const penButtons = subToolbar.locator('button[title="Pen"]');
    await expect(penButtons.first()).toBeVisible();

    // Width buttons should be visible
    await expect(subToolbar.locator('button[title="2px"]')).toBeVisible();
    await expect(subToolbar.locator('button[title="4px"]')).toBeVisible();
  });

  test('eraser button is standalone', async ({ page }) => {
    await switchToEditableTab(page);

    const eraserButton = page.locator('[data-testid="toolbar-eraser"]');
    await expect(eraserButton).toBeVisible();
  });

  test('laser button is standalone', async ({ page }) => {
    await switchToEditableTab(page);

    const laserButton = page.locator('[data-testid="toolbar-laser"]');
    await expect(laserButton).toBeVisible();
  });

  test('locked tab shows toolbar with disabled buttons', async ({ page }) => {
    await switchToEditableTab(page);

    // Lock the tab
    const lockButton = page.locator('[data-testid="toolbar-lock"]');
    await lockButton.click();
    await page.waitForTimeout(200);

    // Button → Tooltip wrapper (relative) → disabled container (opacity-40)
    const selectButton = page.locator('[data-testid="toolbar-select"]');
    const disabledContainer = selectButton.locator('../..');
    await expect(disabledContainer).toHaveClass(/opacity-40/);

    // Unlock for cleanup
    await lockButton.click();
  });
});
