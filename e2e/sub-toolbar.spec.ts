import { test, expect } from '@playwright/test';
import { switchToEditableTab } from './helpers/canvas';

test.describe('SubToolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
  });

  test('pen sub-toolbar appears when pen tool active', async ({ page }) => {
    // Click pen button
    await page.locator('[data-testid="toolbar-draw"]').click();
    await page.waitForTimeout(200);

    // Sub-toolbar should appear with color buttons
    const subToolbar = page.locator('[data-subtoolbar]');
    await expect(subToolbar).toBeVisible();
  });

  test('pen sub-toolbar disappears on tool switch', async ({ page }) => {
    // Activate pen
    await page.locator('[data-testid="toolbar-draw"]').click();
    await page.waitForTimeout(200);
    await expect(page.locator('[data-subtoolbar]')).toBeVisible();

    // Switch to select
    await page.locator('[data-testid="toolbar-select"]').click();
    await page.waitForTimeout(200);

    // Sub-toolbar should disappear
    await expect(page.locator('[data-subtoolbar]')).toHaveCount(0);
  });

  test('pen sub-toolbar shows 8 color buttons + 4 width buttons', async ({ page }) => {
    await page.locator('[data-testid="toolbar-draw"]').click();
    await page.waitForTimeout(200);

    // 8 pen color buttons
    const penButtons = page.locator('[data-subtoolbar] button[title="Pen"]');
    await expect(penButtons).toHaveCount(8);

    // 4 width buttons
    await expect(page.locator('[data-subtoolbar] button[title="2px"]')).toHaveCount(1);
    await expect(page.locator('[data-subtoolbar] button[title="4px"]')).toHaveCount(1);
    await expect(page.locator('[data-subtoolbar] button[title="6px"]')).toHaveCount(1);
    await expect(page.locator('[data-subtoolbar] button[title="8px"]')).toHaveCount(1);
  });

  test('clicking color changes pen color', async ({ page }) => {
    await page.locator('[data-testid="toolbar-draw"]').click();
    await page.waitForTimeout(200);

    // Click the second pen button
    const penButtons = page.locator('[data-subtoolbar] button[title="Pen"]');
    await penButtons.nth(1).click();
    await page.waitForTimeout(200);

    // The draw button in main toolbar should show active state
    const drawButton = page.locator('[data-testid="toolbar-draw"]');
    await expect(drawButton).toHaveClass(/bg-\[var\(--color-gold\)\]/);
  });

  test('clicking width changes pen width', async ({ page }) => {
    await page.locator('[data-testid="toolbar-draw"]').click();
    await page.waitForTimeout(200);

    // Click 6px width
    const width6 = page.locator('[data-subtoolbar] button[title="6px"]');
    await width6.click();
    await page.waitForTimeout(200);

    // 6px button should have active background
    await expect(width6).toHaveClass(/bg-\[var\(--color-surface-light\)\]/);
  });

  test('text sub-toolbar appears when editing text', async ({ page }) => {
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

    // Text sub-toolbar should show font size select
    const subToolbar = page.locator('[data-subtoolbar]');
    await expect(subToolbar).toBeVisible();
    await expect(subToolbar.locator('select')).toBeVisible();
  });

  test('text sub-toolbar disappears when done editing', async ({ page }) => {
    // Create text node
    await page.locator('[data-testid="toolbar-text"]').click();
    await page.waitForTimeout(200);
    const canvas = page.locator('.react-flow');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    // Edit
    const textNode = page.locator('.react-flow__node').last();
    await textNode.dblclick();
    await page.waitForTimeout(300);
    await expect(page.locator('[data-subtoolbar]')).toBeVisible();

    // Exit
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(page.locator('[data-subtoolbar]')).toHaveCount(0);
  });

  test('no sub-toolbar in select mode', async ({ page }) => {
    // By default, select is active
    await expect(page.locator('[data-subtoolbar]')).toHaveCount(0);
  });
});
