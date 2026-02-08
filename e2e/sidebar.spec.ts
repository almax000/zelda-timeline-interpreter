import { test, expect } from '@playwright/test';
import { clearLocalStorage, switchToEditableTab } from './helpers/canvas';

test.describe('Sidebar - Game Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    // Switch to editable tab (sidebar is collapsed on page-0)
    await switchToEditableTab(page);
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
    await page.locator('button', { hasText: '日本語' }).click();
    await expect(page.locator('text=スカイウォードソード').first()).toBeVisible();
  });

  test('game cards are draggable', async ({ page }) => {
    const firstCard = page.locator('[draggable="true"]').first();
    await expect(firstCard).toHaveAttribute('draggable', 'true');
  });

  test('sidebar can be collapsed and expanded', async ({ page }) => {
    // Sidebar is visible
    await expect(page.locator('text=Game Library').first()).toBeVisible();

    // Click collapse button
    await page.getByTitle('Collapse sidebar').click();

    // Sidebar should be hidden
    await expect(page.locator('text=Game Library').first()).not.toBeVisible();

    // Click the expand chevron
    const expandBtn = page.locator('button svg path[d="m9 18 6-6-6-6"]').locator('..');
    await expandBtn.click();

    // Sidebar should be visible again
    await expect(page.locator('text=Game Library').first()).toBeVisible();
  });

  test('sidebar is collapsed on page-0', async ({ page }) => {
    // Switch to page-0
    await page.locator('button', { hasText: '▲' }).click();
    await page.waitForTimeout(300);

    // Sidebar should not be visible
    await expect(page.locator('text=Game Library').first()).not.toBeVisible();
  });
});
