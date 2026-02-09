import { test, expect } from '@playwright/test';
import { clearLocalStorage, switchToEditableTab, expandSidebar } from './helpers/canvas';

test.describe('Sidebar - Game Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    // Switch to editable tab
    await switchToEditableTab(page);
    // Ensure sidebar is expanded
    await expandSidebar(page);
  });

  test('displays game library with search', async ({ page }) => {
    // GameLibrary shows MAINLINE section header
    const mainlineHeader = page.locator('text=MAINLINE').first();
    await expect(mainlineHeader).toBeVisible();

    const searchInput = page.getByPlaceholder('Search games...');
    await expect(searchInput).toBeVisible();
  });

  test('filters games by search term', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search games...');
    await searchInput.fill('Zelda');

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
    // Language is now a <select> dropdown
    const langSelect = page.locator('select');
    await langSelect.selectOption('ja');
    await expect(page.locator('text=スカイウォードソード').first()).toBeVisible();
  });

  test('game cards are draggable', async ({ page }) => {
    const firstCard = page.locator('[draggable="true"]').first();
    await expect(firstCard).toHaveAttribute('draggable', 'true');
  });

  test('sidebar can be collapsed and expanded', async ({ page }) => {
    // Sidebar should show game list
    await expect(page.locator('[draggable="true"]').first()).toBeVisible();

    // Click collapse button
    await page.locator('button[title="Collapse sidebar"]').click();

    // Game list should be hidden when collapsed
    await expect(page.locator('[draggable="true"]').first()).not.toBeVisible();

    // Click expand button
    await page.locator('button[title="Expand sidebar"]').click();

    // Game list should be visible again
    await expect(page.locator('[draggable="true"]').first()).toBeVisible();
  });
});
