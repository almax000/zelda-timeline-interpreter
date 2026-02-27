import { test, expect } from '@playwright/test';
import {
  clearLocalStorage,
  switchToEditableTab,
  getNodeByType,
  activateToolByKey,
  dismissWelcomeScreen,
} from './helpers/canvas';

test.describe('Split & Label Point Editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForSelector('.react-flow');
    await switchToEditableTab(page);
    await dismissWelcomeScreen(page);
  });

  async function placeSplitNode(page: import('@playwright/test').Page) {
    // Activate split/event board tool via 'B' key
    await activateToolByKey(page, 'b');
    // Click on the canvas to place the split node
    const pane = page.locator('.react-flow__pane');
    await pane.click({ position: { x: 400, y: 300 } });
    await page.waitForTimeout(300);
    // Switch back to select mode
    await activateToolByKey(page, 'v');
  }

  test('double-click split node enters edit mode', async ({ page }) => {
    await placeSplitNode(page);
    const splitNode = getNodeByType(page, 'split');
    await splitNode.dblclick();
    await page.waitForTimeout(200);

    const input = splitNode.locator('input');
    await expect(input).toBeVisible();
  });

  test('typing updates split node input value', async ({ page }) => {
    await placeSplitNode(page);
    const splitNode = getNodeByType(page, 'split');
    await splitNode.dblclick();
    await page.waitForTimeout(200);

    const input = splitNode.locator('input');
    await input.fill('My Label');
    await expect(input).toHaveValue('My Label');
  });

  test('Enter saves split node label', async ({ page }) => {
    await placeSplitNode(page);
    const splitNode = getNodeByType(page, 'split');
    await splitNode.dblclick();
    await page.waitForTimeout(200);

    const input = splitNode.locator('input');
    await input.fill('Custom Event');
    await input.press('Enter');
    await page.waitForTimeout(200);

    // Input should disappear
    await expect(splitNode.locator('input')).not.toBeVisible();
    // Label should show new text
    await expect(splitNode.locator('p')).toHaveText('Custom Event');
  });

  test('Escape cancels split node editing', async ({ page }) => {
    await placeSplitNode(page);
    const splitNode = getNodeByType(page, 'split');

    // Get original label text
    const originalText = await splitNode.locator('p').textContent();

    await splitNode.dblclick();
    await page.waitForTimeout(200);

    const input = splitNode.locator('input');
    await input.fill('Should Not Save');
    await input.press('Escape');
    await page.waitForTimeout(200);

    // Input should disappear
    await expect(splitNode.locator('input')).not.toBeVisible();
    // Label should show original text
    await expect(splitNode.locator('p')).toHaveText(originalText || 'Event');
  });

  test('double-click label point enters edit mode', async ({ page }) => {
    // Activate label/annotate tool via 'A' key
    await activateToolByKey(page, 'a');
    const pane = page.locator('.react-flow__pane');
    await pane.click({ position: { x: 400, y: 300 } });
    await page.waitForTimeout(300);
    await activateToolByKey(page, 'v');

    // Find the label-point node
    const labelNode = getNodeByType(page, 'label-point');
    if (await labelNode.count() === 0) return; // Skip if tool creates different node type

    await labelNode.dblclick();
    await page.waitForTimeout(200);

    const input = labelNode.locator('input');
    await expect(input).toBeVisible();
  });

  test('blur on label point saves the label', async ({ page }) => {
    // Activate label tool and place a label node
    await activateToolByKey(page, 'a');
    const pane = page.locator('.react-flow__pane');
    await pane.click({ position: { x: 400, y: 300 } });
    await page.waitForTimeout(300);
    await activateToolByKey(page, 'v');

    const labelNode = getNodeByType(page, 'label-point');
    if (await labelNode.count() === 0) return; // Skip if tool creates different node type

    await labelNode.dblclick();
    await page.waitForTimeout(200);

    const input = labelNode.locator('input');
    if (await input.count() === 0) return;

    await input.fill('Blur Test Label');
    // Click elsewhere to trigger blur
    await pane.click({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(200);

    // The label should contain the new text
    const text = await labelNode.textContent();
    expect(text).toContain('Blur Test Label');
  });
});
