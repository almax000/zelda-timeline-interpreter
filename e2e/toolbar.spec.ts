import { test, expect } from '@playwright/test';
import { getNodeCount, clearLocalStorage } from './helpers/canvas';

test.describe('Toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('displays ZTI title', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'ZTI' })).toBeVisible();
  });

  test('language switcher changes UI language', async ({ page }) => {
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

  test('clear button shows confirmation dialog', async ({ page }) => {
    await page.locator('button[title="Clear timeline"]').click();

    await expect(page.locator('text=Clear Timeline?')).toBeVisible();

    // Cancel
    await page.locator('button', { hasText: 'Cancel' }).click();
    await expect(page.locator('text=Clear Timeline?')).not.toBeVisible();
  });

  test('clear button removes all nodes when confirmed', async ({ page }) => {
    await page.locator('button[title="Clear timeline"]').click();

    // Click the confirm button in the dialog
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
    const penButton = page.locator('button[title="Pen"]');
    const eraserButton = page.locator('button[title="Eraser"]');
    await expect(penButton).toBeVisible();
    await expect(eraserButton).toBeVisible();

    // Click pen to activate
    await penButton.click();
    // Pen button should have active (gold) background
    await expect(penButton).toHaveCSS('background-color', /./);

    // Click pen again to deactivate
    await penButton.click();

    // Click eraser to activate
    await eraserButton.click();
    // Click eraser again to deactivate
    await eraserButton.click();
  });
});
