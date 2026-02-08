import { test, expect } from '@playwright/test';
import { getNodeCount, getEdgeCount, switchToEditableTab } from './helpers/canvas';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Export & Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
    await page.waitForSelector('.react-flow__node');
    // Switch to editable tab for import/export tests
    await switchToEditableTab(page);
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
});
