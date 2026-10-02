// Shared steps for the store end-to-end specs.
import { expect, test } from '@playwright/test';

export const CART_STORAGE_KEY = 'dp_store_cart_v1';

const PRODUCTION_HOSTS = ['yournexttriptoparadise.com', 'www.yournexttriptoparadise.com', 'destinationparadisezanzibar.netlify.app'];

export const usd = (text) => Number(text.replace(/[^0-9.]/g, ''));

// Store preview on, English copy, and never against production (a deployed
// run creates real orders in that site's database).
export function prepareStorePage() {
  test.beforeEach(async ({ page, baseURL }) => {
    test.skip(PRODUCTION_HOSTS.includes(new URL(baseURL).hostname), 'store journeys never run against production');
    await page.addInitScript(() => {
      window.localStorage.setItem('dp_store_preview', '1');
      window.localStorage.setItem('dp_lang', 'en');
    });
  });
}

export async function dismissCookieBanner(page) {
  const essentialOnly = page.getByRole('button', { name: 'Essential only' });
  if (await essentialOnly.isVisible().catch(() => false)) await essentialOnly.click();
}

export async function openBookingPanel(page, slug) {
  await page.goto(`/excursions/${slug}#book`);
  await dismissCookieBanner(page);
  const panel = page.locator('.booking-panel');
  await panel.scrollIntoViewIfNeeded();
  return panel;
}

// `zone` defaults to the first priced area ("other" always needs a quote).
export async function fillPickup(panel, zone = null) {
  const select = panel.locator('select[name="pickupZone"]');
  const value = zone ?? await select.locator('option').evaluateAll((options) =>
    options.map((option) => option.value).find((option) => option && option !== 'other'));
  await select.selectOption(value);
  await panel.locator('input[name="accommodation"]').fill('E2E Beach Hotel');
}

// Any bookable day, then the first time slot with room for the party.
export async function pickDeparture(panel) {
  await panel.locator('.avail-cal__day:not([disabled])').first().click();
  const slot = panel.locator('.slot-grid__slot:not(.is-soldout):not([disabled])').first();
  await expect(slot).toBeVisible();
  await slot.click();
}

export async function addTrip(page, { slug, extraGuests = 0 }) {
  const panel = await openBookingPanel(page, slug);
  for (let i = 0; i < extraGuests; i += 1) await panel.getByRole('button', { name: 'More guests' }).click();
  await fillPickup(panel);
  await pickDeparture(panel);
  await panel.getByRole('button', { name: 'Add to my trip' }).click();
  await expect(page.locator('.cart-nav-btn').first()).toBeVisible();
}

// Rewrites the persisted cart the way an old or hand-edited browser cart
// could look, then reloads so the app reads it back.
export async function editStoredCart(page, patchItem) {
  await page.evaluate(([key, patch]) => {
    const cart = JSON.parse(window.localStorage.getItem(key));
    cart.items = cart.items.map((item, index) => (index === 0 ? { ...item, ...patch } : item));
    window.localStorage.setItem(key, JSON.stringify(cart));
  }, [CART_STORAGE_KEY, patchItem]);
  await page.reload();
  await dismissCookieBanner(page);
}

// Records any call that could start a payment, in fixture or live mode.
export function trackPaymentRequests(page) {
  const calls = [];
  page.on('request', (request) => {
    if (/\/api\/store\/(checkout|pay|dev-pay|accept)\b/.test(new URL(request.url()).pathname)) calls.push(request.url());
  });
  return calls;
}

// Opens the cart drawer and waits until every line is re-quoted (the 20%
// deposit row only appears once the whole cart is priced).
export async function openPricedCart(page) {
  await page.locator('.cart-nav-btn').first().click();
  const drawer = page.locator('.cart-drawer.is-open');
  await expect(drawer).toBeVisible();
  await expect(drawer.locator('.cart-drawer__subtotal')).toHaveCount(2);
  return drawer;
}

// Each cart (or checkout) line as { title, meta, price } in display order.
export async function readLines(container, prefix = 'cart-item') {
  return container.locator(`.${prefix}`).evaluateAll((rows, cls) => rows.map((row) => ({
    title: row.querySelector(`.${cls}__title`)?.textContent.trim(),
    meta: [...row.querySelectorAll(`.${cls}__meta`)].map((el) => el.textContent.trim()).join(' | '),
    price: row.querySelector(`.${cls}__price`)?.textContent.trim(),
  })), prefix);
}

// readLines once no line is still waiting on its re-quote (any cart change
// re-prices every line).
export async function readPricedLines(container, prefix = 'cart-item') {
  let lines = [];
  await expect.poll(async () => {
    lines = await readLines(container, prefix);
    return lines.length > 0 && lines.every((line) => /\$\d/.test(line.price));
  }, { message: 'every line shows a price' }).toBe(true);
  return lines;
}
