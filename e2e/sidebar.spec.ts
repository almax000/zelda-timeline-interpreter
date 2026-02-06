import { test, expect } from '@playwright/test';
import { clearLocalStorage } from './helpers/canvas';

test.describe('Sidebar - Game Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
  });

  test('displays game library with search', async ({ page }) => {
    const sidebar = page.locator('text=Game Library').first();
    await expect(sidebar).toBeVisible();

    const searchInput = page.getByPlaceholder('Search games...');
    await expect(searchInput).toBeVisible();
  });

  test('filters games by search term', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search games...');
    await searchInput.fill('Zelda');

    // Should show games matching "Zelda"
    const gameCards = page.locator('[draggable="true"]');
    const count = await gameCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('shows no results for invalid search', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search games...');
    await searchInput.fill('xyznonexistent');

    const gameCards = page.locator('[draggable="true"]');
    const count = await gameCards.count();
    expect(count).toBe(0);
  });

  test('game names change when language is switched', async ({ page }) => {
    // Click Japanese language button
    await page.locator('button', { hasText: '日本語' }).click();

    // Should show Japanese game names
    await expect(page.locator('text=スカイウォードソード').first()).toBeVisible();
  });

  test('game cards are draggable', async ({ page }) => {
    const firstCard = page.locator('[draggable="true"]').first();
    await expect(firstCard).toHaveAttribute('draggable', 'true');
  });
});
