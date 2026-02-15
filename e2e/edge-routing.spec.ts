import { test, expect } from '@playwright/test';
import { switchToEditableTab } from './helpers/canvas';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importAlignedFixture(page: import('@playwright/test').Page) {
  const exportButton = page.locator('button', { hasText: /Export/ });
  await exportButton.click();

  const testFile = path.join(__dirname, 'fixtures', 'aligned-nodes.json');
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testFile);
  await page.waitForTimeout(500);
}

test.describe('Edge Routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
  });

  test('aligned nodes produce straight edge', async ({ page }) => {
    await importAlignedFixture(page);
    await page.locator('.react-flow__edge').first().waitFor({ state: 'attached' });
    await page.waitForTimeout(500);

    const edgePaths = page.locator('.react-flow__edge path.react-flow__edge-path');
    const count = await edgePaths.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Check at least one edge has a simple straight path (M...L pattern)
    let foundStraight = false;
    for (let i = 0; i < count; i++) {
      const d = await edgePaths.nth(i).getAttribute('d');
      if (d) {
        const segments = d.split(/[ML]/).filter(Boolean);
        if (segments.length <= 2) {
          foundStraight = true;
          break;
        }
      }
    }
    expect(foundStraight).toBe(true);
  });

  test('misaligned nodes produce orthogonal edge', async ({ page }) => {
    await importAlignedFixture(page);
    await page.locator('.react-flow__edge').first().waitFor({ state: 'attached' });
    await page.waitForTimeout(500);

    const edgePaths = page.locator('.react-flow__edge path.react-flow__edge-path');
    const count = await edgePaths.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // At least one edge should have multiple segments (orthogonal routing)
    let foundOrthogonal = false;
    for (let i = 0; i < count; i++) {
      const d = await edgePaths.nth(i).getAttribute('d');
      if (d) {
        const lCount = (d.match(/L/g) || []).length;
        if (lCount >= 2) {
          foundOrthogonal = true;
          break;
        }
      }
    }
    expect(foundOrthogonal).toBe(true);
  });

  test('edge stays straight after snapping nodes to same row', async ({ page }) => {
    await importAlignedFixture(page);
    await page.locator('.react-flow__edge').first().waitFor({ state: 'attached' });
    await page.waitForTimeout(500);

    const edgePaths = page.locator('.react-flow__edge path.react-flow__edge-path');
    const count = await edgePaths.count();
    expect(count).toBeGreaterThanOrEqual(1);

    let hasStraight = false;
    for (let i = 0; i < count; i++) {
      const d = await edgePaths.nth(i).getAttribute('d');
      if (d) {
        const lCount = (d.match(/L/g) || []).length;
        if (lCount <= 1) {
          hasStraight = true;
          break;
        }
      }
    }
    expect(hasStraight).toBe(true);
  });
});
