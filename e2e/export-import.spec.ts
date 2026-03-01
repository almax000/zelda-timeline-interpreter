import { test, expect } from '@playwright/test';
import { getNodeCount, getEdgeCount, switchToEditableTab, importFixtureViaUI } from './helpers/canvas';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Export & Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
    // Switch to editable tab and import fixture for export tests
    await switchToEditableTab(page);
    await importFixtureViaUI(page);
    await page.waitForSelector('.react-flow__node');
  });

  test('exports JSON file', async ({ page }) => {
    const exportButton = page.locator('button', { hasText: /Export/ });
    await exportButton.click();

    const downloadPromise = page.waitForEvent('download');
    await page.locator('text=Export as JSON').click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/zelda-timeline-.*\.json$/);
  });

  test('imports timeline from JSON file', async ({ page }) => {
    const exportButton = page.locator('button', { hasText: /Export/ });
    await exportButton.click();

    const fileInput = page.locator('input[type="file"]');
    const testFile = path.join(__dirname, 'fixtures', 'test-timeline.json');
    await fileInput.setInputFiles(testFile);

    await page.waitForTimeout(500);

    const nodeCount = await getNodeCount(page);
    expect(nodeCount).toBe(3);

    const edgeCount = await getEdgeCount(page);
    expect(edgeCount).toBe(2);
  });

  test('PNG export triggers download', async ({ page }) => {
    const exportButton = page.locator('button', { hasText: /Export/ });
    await exportButton.click();

    const downloadPromise = page.waitForEvent('download');
    await page.locator('text=Export as PNG').click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/zelda-timeline-.*\.png$/);
  });

  test('JSON round-trip preserves node and edge counts', async ({ page }) => {
    const initialNodeCount = await getNodeCount(page);
    const initialEdgeCount = await getEdgeCount(page);

    // Export JSON
    const exportButton = page.locator('button', { hasText: /Export/ });
    await exportButton.click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('text=Export as JSON').click();
    const download = await downloadPromise;

    // Read the downloaded file content
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    // Create a new tab and import the exported file
    await page.getByTitle('New canvas').click();
    await page.waitForTimeout(300);
    const tab2 = page.locator('button', { hasText: '2' }).first();
    await tab2.click();
    await page.waitForTimeout(300);

    // Import the downloaded file
    const exportButton2 = page.locator('button', { hasText: /Export/ });
    await exportButton2.click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(downloadPath!);
    await page.waitForTimeout(500);

    const newNodeCount = await getNodeCount(page);
    const newEdgeCount = await getEdgeCount(page);
    expect(newNodeCount).toBe(initialNodeCount);
    expect(newEdgeCount).toBe(initialEdgeCount);
  });

  test('PDF export triggers download', async ({ page }) => {
    const exportButton = page.locator('button', { hasText: /Export/ });
    await exportButton.click();

    const downloadPromise = page.waitForEvent('download');
    await page.locator('text=Export as PDF').click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/zelda-timeline-.*\.pdf$/);
  });

  test('importing invalid JSON shows no crash', async ({ page }) => {
    const exportButton = page.locator('button', { hasText: /Export/ });
    await exportButton.click();

    const testFile = path.join(__dirname, 'fixtures', 'invalid-timeline.json');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFile);
    await page.waitForTimeout(500);

    // App should not crash - canvas should still be functional
    const canvas = page.locator('.react-flow');
    await expect(canvas).toBeVisible();

    // Node count should be unchanged or reset, but app should be stable
    const newNodeCount = await getNodeCount(page);
    expect(newNodeCount).toBeGreaterThanOrEqual(0);
  });

  test('exported JSON contains version field', async ({ page }) => {
    const exportButton = page.locator('button', { hasText: /Export/ });
    await exportButton.click();

    const downloadPromise = page.waitForEvent('download');
    await page.locator('text=Export as JSON').click();
    const download = await downloadPromise;

    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    // Read the file and verify version field
    const fs = await import('fs');
    const content = fs.readFileSync(downloadPath!, 'utf-8');
    const parsed = JSON.parse(content);
    expect(parsed.version).toBe('1.0.0');
  });
});
