import { test, expect } from '@playwright/test';

// Smoke tests for the interaction JS in Layout.astro and Frames.astro.
// These defend behavioral contracts, not markup: menu focus handling,
// lightbox keyboard flow, and the scroll-reveal "content must never stay
// invisible" invariant.

test.describe('mobile menu', () => {
  // burger is only rendered visible below the mobile breakpoint
  test.use({ viewport: { width: 480, height: 800 } });

  test('opens on burger click, Escape closes and returns focus to burger', async ({ page }) => {
    await page.goto('/');
    const burger = page.locator('#burger');
    const menu = page.locator('#mobileMenu');

    // closed menu must be out of the tab order (visibility, not just opacity)
    await expect(menu).toBeHidden();

    await burger.click();
    await expect(menu).toBeVisible();
    await expect(burger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    // a11y invariant: keyboard users must not be stranded in the hidden menu
    await expect(burger).toBeFocused();
  });

  test('selecting a menu link closes the menu', async ({ page }) => {
    await page.goto('/');
    await page.locator('#burger').click();
    const menu = page.locator('#mobileMenu');
    await expect(menu).toBeVisible();

    await menu.getByRole('link', { name: 'About' }).click();
    await expect(menu).toBeHidden();
  });
});

test.describe('lightbox', () => {
  test('opens on photo click, arrows navigate, Escape closes', async ({ page }) => {
    await page.goto('/');
    const lightbox = page.locator('#lightbox');
    await expect(lightbox).toBeHidden();

    const firstPhoto = page.locator('#frames .ph-link').first();
    await firstPhoto.scrollIntoViewIfNeeded();
    await firstPhoto.click();

    await expect(lightbox).toBeVisible();
    const img = page.locator('#lbImg');
    await expect(img).toHaveAttribute('src', /.+/);
    await expect(page.locator('#lbCount')).toHaveText(/^01 \/ \d{2}$/);

    // keyboard navigation wraps through the set
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#lbCount')).toHaveText(/^02 \/ \d{2}$/);
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#lbCount')).toHaveText(/^01 \/ \d{2}$/);

    // native <dialog>: Escape must close
    await page.keyboard.press('Escape');
    await expect(lightbox).toBeHidden();
    // image is dropped so a reopen never flashes the previous photo
    await expect(img).not.toHaveAttribute('src', /.+/);
  });
});

test.describe('scroll reveal', () => {
  test('below-the-fold content becomes visible after scrolling', async ({ page }) => {
    await page.goto('/');
    const contactHeading = page.locator('#contact h2');

    // worst-case failure mode for this site: content stays invisible forever
    await contactHeading.scrollIntoViewIfNeeded();
    await expect(contactHeading).toHaveClass(/\bin\b/);
    await expect(contactHeading).toHaveCSS('opacity', '1');
  });

  test('reduced motion shows all content immediately without scrolling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('#contact h2')).toHaveCSS('opacity', '1');
  });
});
