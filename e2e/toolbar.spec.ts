import { test, expect } from '@playwright/test';
import { getNodeCount, switchToEditableTab } from './helpers/canvas';

test.describe('Toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('displays ZTI title', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'ZTI' })).toBeVisible();
  });

  test('language switcher changes UI language', async ({ page }) => {
    // Switch to editable tab to see sidebar
    await switchToEditableTab(page);

    // Switch to Japanese
    await page.locator('button', { hasText: '日本語' }).click();
    await expect(page.getByRole('heading', { name: 'ゲームライブラリ' })).toBeVisible();

    // Switch to zh-CN
    await page.locator('button', { hasText: '简体中文' }).click();
    await expect(page.getByRole('heading', { name: '游戏库' })).toBeVisible();

    // Switch to zh-TW
    await page.locator('button', { hasText: '繁體中文' }).click();
    await expect(page.getByRole('heading', { name: '遊戲庫' })).toBeVisible();

    // Switch back to English
    await page.locator('button', { hasText: 'English' }).click();
    await expect(page.getByRole('heading', { name: 'Game Library' })).toBeVisible();
  });

  test('clear button in floating toolbar shows confirmation dialog', async ({ page }) => {
    // Switch to editable tab (floating toolbar only shows on editable tabs)
    await switchToEditableTab(page);

    await page.locator('button[title="Clear"]').click();
    await expect(page.locator('text=Clear Timeline?')).toBeVisible();

    // Cancel
    await page.locator('button', { hasText: 'Cancel' }).click();
    await expect(page.locator('text=Clear Timeline?')).not.toBeVisible();
  });

  test('clear button removes all nodes when confirmed', async ({ page }) => {
    await switchToEditableTab(page);
    await page.waitForSelector('.react-flow__node');

    await page.locator('button[title="Clear"]').click();

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

  test('pen and eraser toggle buttons work in floating toolbar', async ({ page }) => {
    // Switch to editable tab (floating toolbar only shows on editable tabs)
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

  test('floating toolbar is hidden on page-0', async ({ page }) => {
    // On page-0 by default - floating toolbar should not be visible
    await expect(page.locator('button[title="Eraser"]')).not.toBeVisible();
  });
});
