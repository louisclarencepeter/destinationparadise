// Customer journey through the experiences store (HANDOFF.md "Required
// testing → Customer journey"): two trips with their own dates/guests, cart
// recovery after refresh, checkout validation, simulated payment, and one order
// confirmation with a booking code per trip.
//
// Runs against local Vite + fixtures by default, or a deployed site via
// E2E_BASE_URL (see playwright.config.js). A deployed run creates a real order
// in that site's database, so it refuses the production hosts.
import { expect, test } from '@playwright/test';

const PRODUCTION_HOSTS = ['yournexttriptoparadise.com', 'www.yournexttriptoparadise.com', 'destinationparadisezanzibar.netlify.app'];

const TRIPS = [
  { slug: 'safari-blue', title: 'Safari Blue', extraGuests: 1 },
  { slug: 'spice-tour', title: 'Spice Tour', extraGuests: 2 },
];

const usd = (text) => Number(text.replace(/[^0-9.]/g, ''));

test.beforeEach(async ({ page, baseURL }) => {
  test.skip(PRODUCTION_HOSTS.includes(new URL(baseURL).hostname), 'checkout journey never runs against production');
  await page.addInitScript(() => {
    window.localStorage.setItem('dp_store_preview', '1');
    window.localStorage.setItem('dp_lang', 'en');
  });
});

async function dismissCookieBanner(page) {
  const essentialOnly = page.getByRole('button', { name: 'Essential only' });
  if (await essentialOnly.isVisible().catch(() => false)) await essentialOnly.click();
}

async function addTrip(page, { slug, extraGuests }) {
  await page.goto(`/excursions/${slug}#book`);
  await dismissCookieBanner(page);
  const panel = page.locator('.booking-panel');
  await panel.scrollIntoViewIfNeeded();

  for (let i = 0; i < extraGuests; i += 1) await panel.getByRole('button', { name: 'More guests' }).click();

  // Pickup is required: first priced zone (not "other", which needs a quote).
  const zone = panel.locator('select[name="pickupZone"]');
  const zoneValue = await zone.locator('option').evaluateAll((options) =>
    options.map((option) => option.value).find((value) => value && value !== 'other'));
  await zone.selectOption(zoneValue);
  await panel.locator('input[name="accommodation"]').fill('E2E Beach Hotel');

  // Any bookable day, then the first time slot with room for the party.
  await panel.locator('.avail-cal__day:not([disabled])').first().click();
  const slot = panel.locator('.slot-grid__slot:not(.is-soldout):not([disabled])').first();
  await expect(slot).toBeVisible();
  await slot.click();

  await panel.getByRole('button', { name: 'Add to my trip' }).click();
  await expect(page.locator('.cart-nav-btn').first()).toBeVisible();
}

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
