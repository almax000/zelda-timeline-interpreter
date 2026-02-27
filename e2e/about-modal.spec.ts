import { test, expect } from '@playwright/test';

test.describe('About Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('About button opens the modal', async ({ page }) => {
    const aboutButton = page.locator('button[title="About"]');
    await aboutButton.click();
    await page.waitForTimeout(300);

    await expect(page.getByText('About').first()).toBeVisible();
    // The modal heading should be visible
    const heading = page.locator('h3', { hasText: 'About' });
    await expect(heading).toBeVisible();
  });

  test('modal shows disclaimer text', async ({ page }) => {
    const aboutButton = page.locator('button[title="About"]');
    await aboutButton.click();
    await page.waitForTimeout(300);

    await expect(page.getByText('unofficial fan project')).toBeVisible();
  });

  test('modal has GitHub link', async ({ page }) => {
    const aboutButton = page.locator('button[title="About"]');
    await aboutButton.click();
    await page.waitForTimeout(300);

    const githubLink = page.locator('a[title="GitHub"]');
    await expect(githubLink).toBeVisible();
    const href = await githubLink.getAttribute('href');
    expect(href).toContain('github.com');
  });

  test('Close button closes the modal', async ({ page }) => {
    const aboutButton = page.locator('button[title="About"]');
    await aboutButton.click();
    await page.waitForTimeout(300);

    const heading = page.locator('h3', { hasText: 'About' });
    await expect(heading).toBeVisible();

    // Click the Close button
    const closeButton = page.getByText('Close');
    await closeButton.click();
    await page.waitForTimeout(300);

    await expect(heading).not.toBeVisible();
  });

  test('clicking backdrop closes the modal', async ({ page }) => {
    const aboutButton = page.locator('button[title="About"]');
    await aboutButton.click();
    await page.waitForTimeout(300);

    const heading = page.locator('h3', { hasText: 'About' });
    await expect(heading).toBeVisible();

    // Click the backdrop overlay
    const backdrop = page.locator('.bg-black\\/60');
    await backdrop.click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);

    await expect(heading).not.toBeVisible();
  });
});
