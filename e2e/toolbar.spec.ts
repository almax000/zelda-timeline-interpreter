import { test, expect } from '@playwright/test';
import { getNodeCount, clearLocalStorage } from './helpers/canvas';

test.describe('Toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('displays title and subtitle', async ({ page }) => {
    await expect(page.locator('text=Zelda Timeline Interpreter')).toBeVisible();
  });

  test('language switcher changes UI language', async ({ page }) => {
    // Switch to Japanese
    await page.locator('button', { hasText: '日本語' }).click();
    await expect(page.locator('text=ゲームライブラリ')).toBeVisible();

    // Switch to zh-CN
    await page.locator('button', { hasText: '简中' }).click();
    await expect(page.locator('text=游戏库')).toBeVisible();

    // Switch to zh-TW
    await page.locator('button', { hasText: '繁中' }).click();
    await expect(page.locator('text=遊戲庫')).toBeVisible();

    // Switch back to English
    await page.locator('button', { hasText: 'EN' }).click();
    await expect(page.locator('text=Game Library')).toBeVisible();
  });

  test('clear button shows confirmation dialog', async ({ page }) => {
    await page.locator('button', { hasText: 'Clear' }).click();

    await expect(page.locator('text=Clear Timeline?')).toBeVisible();

    // Cancel
    await page.locator('button', { hasText: 'Cancel' }).click();
    await expect(page.locator('text=Clear Timeline?')).not.toBeVisible();
  });

  test('clear button removes all nodes when confirmed', async ({ page }) => {
    await page.locator('button', { hasText: 'Clear' }).click();

    // Click the confirm button in the dialog (not the toolbar "Clear" button)
    const confirmButton = page.locator('.fixed.z-50 button', { hasText: 'Clear' });
    await confirmButton.click();

    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBe(0);
  });

  test('load official timeline button works', async ({ page }) => {
    // First clear the timeline
    await page.locator('button', { hasText: 'Clear' }).click();
    const confirmClearButton = page.locator('.fixed.z-50 button', { hasText: 'Clear' });
    await confirmClearButton.click();
    await page.waitForTimeout(300);

    // Load official timeline
    await page.locator('button', { hasText: 'Load Official Timeline' }).click();

    // Click the "Load" confirm button in the dialog
    const loadConfirmButton = page.locator('.fixed.z-50 button', { hasText: /^Load$/ });
    await loadConfirmButton.click();

    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBeGreaterThan(0);
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
});
