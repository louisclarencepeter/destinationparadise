// Store catalogue status filters: All / Available / Coming soon / On request
// with counts that follow the search box, and only Available cards leading
// to the instant booking panel.
import { expect, test } from '@playwright/test';
import { prepareStorePage } from './helpers.js';

prepareStorePage();

const chip = (page, name) => page.locator('.store-chips__chip', { hasText: name });
const countOf = async (page, name) => Number((await chip(page, name).locator('.store-chips__chip-count').innerText()).replace(/\D/g, ''));

test('filters the catalogue by booking status with matching counts', async ({ page }) => {
  await page.goto('/store');
  const cards = page.locator('.store-grid .exp-card');
  await expect(cards.first()).toBeVisible();

  const all = await countOf(page, 'All');
  expect(await countOf(page, 'Available')).toBe(3);
  expect(all).toBe(await countOf(page, 'Available') + await countOf(page, 'Coming soon') + await countOf(page, 'On request'));
  await expect(cards).toHaveCount(all);

  await chip(page, 'Available').click();
  await expect(cards).toHaveCount(3);
  await expect(cards.locator('a[href$="#book"]')).toHaveCount(3);

  await chip(page, 'Coming soon').click();
  await expect(cards).toHaveCount(await countOf(page, 'Coming soon'));
  await expect(cards.locator('a[href$="#book"]')).toHaveCount(0);
  await expect(cards.first()).toContainText('Online booking coming soon');

  await chip(page, 'On request').click();
  await expect(cards.first().locator('a')).toHaveAttribute('href', /\/book-now\?type=excursion/);

  // Search narrows every chip count, and the active filter still applies.
  await page.locator('#store-search-q').fill('safari blue');
  await expect(cards).toHaveCount(0);
  expect(await countOf(page, 'Available')).toBe(1);
  await chip(page, 'All').click();
  await expect(cards).toHaveCount(await countOf(page, 'All'));
});

test('Coming soon details page never offers the instant booking panel', async ({ page }) => {
  await page.goto('/store');
  await chip(page, 'Coming soon').click();
  await page.locator('.store-grid .exp-card a').first().click();
  await expect(page).toHaveURL(/\/excursions\/[a-z-]+$/);
  await expect(page.locator('#book')).toHaveCount(0);
  await expect(page.locator('.booking-panel')).toHaveCount(0);
});
