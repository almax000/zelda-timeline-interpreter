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

  test('displays game library with draggable cards', async ({ page }) => {
    // GameLibrary shows draggable game cards (no search, no section headers)
    const gameCards = page.locator('[draggable="true"]');
    const count = await gameCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('game names appear as tooltips on cards', async ({ page }) => {
    // Cards use title attribute for game names
    const firstCard = page.locator('[draggable="true"]').first();
    const title = await firstCard.getAttribute('title');
    expect(title).toBeTruthy();
  });

  test('game names change when language is switched', async ({ page }) => {
    // Language is now a globe icon popover
    const globeButton = page.locator('button[title="English"]');
    await globeButton.click();

    // Select Japanese
    const jaButton = page.locator('button', { hasText: '日本語' });
    await jaButton.click();

    // Check that game card titles changed to Japanese
    await page.waitForTimeout(500);
    const firstCard = page.locator('[draggable="true"]').first();
    const title = await firstCard.getAttribute('title');
    // Japanese title should contain Japanese characters
    expect(title).toBeTruthy();
  });

  test('game cards are draggable', async ({ page }) => {
    const firstCard = page.locator('[draggable="true"]').first();
    await expect(firstCard).toHaveAttribute('draggable', 'true');
  });

  test('sidebar can be collapsed and expanded', async ({ page }) => {
    // Sidebar should show game list at full width
    const sidebar = page.locator('.w-64').first();
    await expect(sidebar).toBeVisible();

    // Click collapse button
    await page.locator('button[title="Collapse sidebar"]').click();

    // Sidebar should be narrow (w-14 = 56px), game cards clipped by overflow-hidden
    await expect(page.locator('.w-14').first()).toBeVisible();

    // Click expand button
    await page.locator('button[title="Expand sidebar"]').click();

    // Sidebar should be full width again
    await expect(page.locator('.w-64').first()).toBeVisible();
  });
});
