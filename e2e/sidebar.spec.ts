import { test, expect } from '@playwright/test';
import { clearLocalStorage, switchToEditableTab } from './helpers/canvas';

test.describe('Sidebar - Game Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    // Switch to editable tab
    await switchToEditableTab(page);
  });

  test('displays game library with draggable cards', async ({ page }) => {
    // GameLibrary shows draggable game cards (no search, no section headers)
    const gameCards = page.locator('[draggable="true"]');
    const count = await gameCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('game names appear as text in cards', async ({ page }) => {
    // Cards show game name as text content
    const firstCard = page.locator('[draggable="true"]').first();
    const text = await firstCard.locator('p').textContent();
    expect(text).toBeTruthy();
  });

  test('game names change when language is switched', async ({ page }) => {
    // Get English game name
    const firstCard = page.locator('[draggable="true"]').first();
    const englishName = await firstCard.locator('p').textContent();

    // Language is now a globe icon popover
    const globeButton = page.locator('button[title="English"]');
    await globeButton.click();

    // Select Japanese
    const jaButton = page.locator('button', { hasText: '日本語' });
    await jaButton.click();

    // Check that game card text changed
    await page.waitForTimeout(500);
    const jaName = await firstCard.locator('p').textContent();
    expect(jaName).toBeTruthy();
    expect(jaName).not.toEqual(englishName);
  });

  test('game cards are draggable', async ({ page }) => {
    const firstCard = page.locator('[draggable="true"]').first();
    await expect(firstCard).toHaveAttribute('draggable', 'true');
  });

  test('sidebar is always visible at full width', async ({ page }) => {
    // Sidebar should show game list at full width (w-64 = 256px)
    const sidebar = page.locator('.w-64').first();
    await expect(sidebar).toBeVisible();
  });
});
