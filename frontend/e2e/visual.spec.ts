import { test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// Screenshots are saved to .reg/actual/ for reg-suit visual regression comparison.
const ACTUAL_DIR = path.join(process.cwd(), '.reg', 'actual');

test.beforeAll(() => {
  fs.mkdirSync(ACTUAL_DIR, { recursive: true });
});

test.describe('@visual', () => {
  test('home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: path.join(ACTUAL_DIR, 'home.png'),
      fullPage: true,
    });
  });
});
