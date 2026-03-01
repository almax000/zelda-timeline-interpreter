import { test, expect } from '@playwright/test';
import { getNodeCount, clearLocalStorage, switchToEditableTab, importFixtureViaUI } from './helpers/canvas';

test.describe('Share', () => {
  test('copies share link to clipboard', async ({ context, page }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__node');

    // Click Share button
    const shareButton = page.locator('button', { hasText: /Share/ }).first();
    await shareButton.click();

    // Should show "Link copied!" feedback
    await expect(page.locator('text=Link copied!')).toBeVisible({ timeout: 3000 });

    // Verify clipboard contains a share URL
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('#share=');
  });

  test('share link loads timeline in new tab', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__node');

    // Share
    const shareButton = page.locator('button', { hasText: /Share/ }).first();
    await shareButton.click();
    await page.waitForTimeout(500);

    // Get the share URL from clipboard
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());

    // Navigate to share URL (simulates opening the link)
    await page.goto(shareUrl);
    await page.waitForSelector('.react-flow');
    await page.waitForTimeout(1000);

    // Should load the shared timeline nodes
    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBeGreaterThanOrEqual(3);
  });

  test('empty canvas share link is small enough', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');

    // Create a new empty tab (canvas-1 has official timeline preloaded)
    await page.getByTitle('New canvas').click();
    await page.waitForTimeout(300);

    // Share empty canvas
    const shareButton = page.locator('button', { hasText: /Share/ }).first();
    await shareButton.click();

    // Should copy successfully (empty canvas is small)
    await expect(page.locator('text=Link copied!')).toBeVisible({ timeout: 3000 });
  });
});
