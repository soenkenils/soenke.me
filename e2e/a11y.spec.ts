import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Automated WCAG 2.1 A/AA scan of every page, plus the two interactive states
// that only exist after a user action (the modal dialogs). axe catches roughly
// a third of real a11y defects — contrast, names, roles, landmarks — so a pass
// here is a floor, not a guarantee.

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('accessibility', () => {
  for (const path of ['/', '/datenschutz', '/404']) {
    test(`${path} has no WCAG A/AA violations`, async ({ page }) => {
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
    });
  }

  test('open lightbox has no WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    const photo = page.locator('#frames .ph-link').first();
    await photo.scrollIntoViewIfNeeded();
    await photo.click();
    await expect(page.locator('#lightbox')).toBeVisible();

    const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
  });

  test('open racer dialog has no WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    for (const key of ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']) {
      await page.keyboard.press(key);
    }
    await expect(page.locator('#racer')).toBeVisible();

    const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
  });
});
