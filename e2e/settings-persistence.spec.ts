import { test, expect } from '@playwright/test';
import { clearLocalStorage, switchToEditableTab } from './helpers/canvas';

test.describe('Settings Persistence', () => {
  test('language setting persists in localStorage after page reload', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);

    // Switch to Japanese via globe icon
    const globeButton = page.locator('button[title="English"]');
    await globeButton.click();
    await page.locator('button', { hasText: '日本語' }).click();
    await page.waitForTimeout(500);

    // Verify language changed via localStorage
    const langBefore = await page.evaluate(() => {
      const raw = localStorage.getItem('zelda-timeline-settings');
      if (!raw) return null;
      return JSON.parse(raw).state?.language;
    });
    expect(langBefore).toBe('ja');

    // Reload
    await page.reload();
    await page.waitForSelector('.react-flow');
    await page.waitForTimeout(500);

    // Language should still be Japanese in localStorage (Zustand persist works)
    const langAfter = await page.evaluate(() => {
      const raw = localStorage.getItem('zelda-timeline-settings');
      if (!raw) return null;
      return JSON.parse(raw).state?.language;
    });
    expect(langAfter).toBe('ja');

    // Clean up
    await page.evaluate(() => localStorage.clear());
  });

  test('coverRegion auto-syncs with language selection', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);

    // Default is English → US covers
    // Switch to Japanese → should auto-switch to JP covers
    const globeButton = page.locator('button[title="English"]');
    await globeButton.click();
    await page.locator('button', { hasText: '日本語' }).click();
    await page.waitForTimeout(500);

    // Verify JP covers are shown by checking localStorage
    const coverRegion = await page.evaluate(() => {
      const raw = localStorage.getItem('zelda-timeline-settings');
      if (!raw) return null;
      return JSON.parse(raw).state?.coverRegion;
    });
    expect(coverRegion).toBe('jp');

    // Switch back to English → should auto-switch to US covers
    await page.locator('button[title="日本語"]').click();
    await page.locator('button', { hasText: 'English' }).click();
    await page.waitForTimeout(500);

    const coverRegionEn = await page.evaluate(() => {
      const raw = localStorage.getItem('zelda-timeline-settings');
      if (!raw) return null;
      return JSON.parse(raw).state?.coverRegion;
    });
    expect(coverRegionEn).toBe('us');
  });
});
