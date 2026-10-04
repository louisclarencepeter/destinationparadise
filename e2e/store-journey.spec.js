// Customer journey through the experiences store (HANDOFF.md "Required
// testing → Customer journey"): two trips with their own dates/guests, cart
// recovery after refresh, checkout validation, simulated payment, and one order
// confirmation with a booking code per trip.
//
// Runs against local Vite + fixtures by default, or a deployed site via
// E2E_BASE_URL (see playwright.config.js). A deployed run creates a real order
// in that site's database, so helpers.js skips the production hosts.
import { expect, test } from '@playwright/test';
import { addTrip, dismissCookieBanner, prepareStorePage, usd } from './helpers.js';

const TRIPS = [
  { slug: 'safari-blue', title: 'Safari Blue', extraGuests: 1 },
  { slug: 'spice-tour', title: 'Spice Tour', extraGuests: 2 },
];

prepareStorePage();

test('books two experiences in one order', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  for (const trip of TRIPS) await addTrip(page, trip);

  // The cart survives a refresh.
  await page.reload();
  await dismissCookieBanner(page);
  await page.locator('.cart-nav-btn').first().click();
  const drawer = page.locator('.cart-drawer.is-open');
  await expect(drawer).toBeVisible();
  for (const { title } of TRIPS) await expect(drawer).toContainText(title);
  await expect(drawer).toContainText('2 experiences');

  // Prices are re-quoted on open; wait for the subtotal and 20% deposit rows.
  const totals = drawer.locator('.cart-drawer__subtotal strong');
  await expect(totals).toHaveCount(2);
  const subtotal = usd(await totals.nth(0).innerText());
  expect(subtotal).toBeGreaterThan(0);

  // Checkout charges a 20% deposit (rounded up to the cent); the rest is due
  // on the day of each trip.
  const deposit = Math.ceil(Math.round(subtotal * 100) / 5) / 100;
  expect(usd(await totals.nth(1).innerText())).toBe(deposit);

  await drawer.getByRole('button', { name: 'Continue to checkout' }).click();
  await expect(page).toHaveURL(/\/store\/checkout$/);

  const pay = page.getByRole('button', { name: /^Pay .*deposit/ });
  await expect(pay).toContainText(`$${deposit}`);

  // Empty submit surfaces validation instead of paying.
  await pay.click();
  await expect(page.locator('.checkout-field__error').first()).toBeVisible();
  await expect(page).toHaveURL(/\/store\/checkout$/);

  await page.locator('#checkout-name').fill('E2E Test Guest');
  await page.locator('#checkout-email').fill('e2e-store@example.com');
  await page.locator('#checkout-phone').fill('+255777000000');
  await pay.click();

  await expect(page).toHaveURL(/\/store\/order\/DP-\d{4}-\w+/, { timeout: 30_000 });
  const confirmation = page.locator('main');
  await expect(confirmation).toContainText('deposit has been received');
  for (const { title } of TRIPS) await expect(confirmation).toContainText(title);
  await expect(confirmation.getByText(/CONF · [A-Z]{2}-\w+/)).toHaveCount(TRIPS.length);
  await expect(confirmation.getByText('Confirmed · deposit received')).toHaveCount(TRIPS.length);
  await expect(confirmation).toContainText(`$${deposit}`);

  // The order clears the cart.
  await expect(page.locator('.cart-nav-btn').first()).not.toContainText(/\d/);

  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflowX).toBeLessThanOrEqual(0);
  expect(pageErrors).toEqual([]);
});
