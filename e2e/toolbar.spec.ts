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

    const clearButton = page.locator('button[title="Clear"]');
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

  test('lock button toggles lock state', async ({ page }) => {
    await switchToEditableTab(page);

    const lockButton = page.locator('[data-testid="toolbar-lock"]');
    await expect(lockButton).toBeVisible();

    // Lock the tab
    await lockButton.click();
    await page.waitForTimeout(200);

    // Other buttons should be visually disabled (opacity-40)
    const selectButton = page.locator('[data-testid="toolbar-select"]');
    const parentDiv = selectButton.locator('..');
    await expect(parentDiv).toHaveClass(/opacity-40/);

    // Unlock the tab
    await lockButton.click();
    await page.waitForTimeout(200);

    // Buttons should be enabled again
    await expect(parentDiv).not.toHaveClass(/opacity-40/);
  });

  test('annotate button activates annotate mode', async ({ page }) => {
    await switchToEditableTab(page);

    const annotateButton = page.locator('[data-testid="toolbar-annotate"]');
    await expect(annotateButton).toBeVisible();
    await annotateButton.click();

    // Canvas should have crosshair cursor
    const canvasContainer = page.locator('.flex-1.h-full.relative');
    await expect(canvasContainer).toHaveClass(/cursor-crosshair/);

    // Click select to deactivate
    await page.locator('[data-testid="toolbar-select"]').click();
    await expect(canvasContainer).not.toHaveClass(/cursor-crosshair/);
  });

  test('shapes popover opens and shows shape options', async ({ page }) => {
    await switchToEditableTab(page);

    const shapesButton = page.locator('[data-testid="toolbar-shapes"]');
    await shapesButton.click();

    // Popover should appear with shape buttons
    await expect(page.locator('button[title="Rectangle"]')).toBeVisible();
    await expect(page.locator('button[title="Circle"]')).toBeVisible();
    await expect(page.locator('button[title="Arrow"]')).toBeVisible();
    await expect(page.locator('button[title="Line"]')).toBeVisible();

    // Click rectangle to select and close popover (dispatchEvent: popover may be outside viewport)
    await page.locator('button[title="Rectangle"]').dispatchEvent('click');
    await page.waitForTimeout(200);

    // Canvas should have crosshair cursor for shape placement
    const canvasContainer = page.locator('.flex-1.h-full.relative');
    await expect(canvasContainer).toHaveClass(/cursor-crosshair/);
  });

  test('draw popover opens and shows pen colors + widths', async ({ page }) => {
    await switchToEditableTab(page);

    const drawButton = page.locator('[data-testid="toolbar-draw"]');
    await drawButton.click();

    // Pen buttons should be visible inside the popover
    const penButtons = page.locator('button[title="Pen"]');
    await expect(penButtons.first()).toBeVisible();

    // Width buttons should be visible
    await expect(page.locator('button[title="2px"]')).toBeVisible();
    await expect(page.locator('button[title="4px"]')).toBeVisible();

    // Eraser should be visible
    await expect(page.locator('button[title="Eraser"]')).toBeVisible();
  });

  test('branch popover shows branch color options', async ({ page }) => {
    await switchToEditableTab(page);

    const branchButton = page.locator('[data-testid="toolbar-branch"]');
    await branchButton.click();

    // Branch options should appear
    await expect(page.locator(`button[title="Main"]`)).toBeVisible();
    await expect(page.locator(`button[title="Child Timeline"]`)).toBeVisible();
    await expect(page.locator(`button[title="Adult Timeline"]`)).toBeVisible();
    await expect(page.locator(`button[title="Fallen Hero Timeline"]`)).toBeVisible();
  });

  test('locked page shows toolbar with disabled buttons', async ({ page }) => {
    // On page-0 by default - lock button should be visible
    const lockButton = page.locator('[data-testid="toolbar-lock"]');
    await expect(lockButton).toBeVisible();

    // Other buttons should exist but be disabled (opacity-40)
    const selectButton = page.locator('[data-testid="toolbar-select"]');
    const parentDiv = selectButton.locator('..');
    await expect(parentDiv).toHaveClass(/opacity-40/);
  });
});
