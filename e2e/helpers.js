// Shared steps for the store end-to-end specs.
import { expect, test } from '@playwright/test';

export const CART_STORAGE_KEY = 'dp_store_cart_v1';

const PRODUCTION_HOSTS = ['yournexttriptoparadise.com', 'www.yournexttriptoparadise.com', 'destinationparadisezanzibar.netlify.app'];

export const usd = (text) => Number(text.replace(/[^0-9.]/g, ''));

// Store preview on, cookie choice made, starting language set (kept if the
// test switches language later), and never against production (a deployed
// run creates real orders in that site's database).
export function prepareStorePage(lang = 'en') {
  test.beforeEach(async ({ page, baseURL }) => {
    test.skip(PRODUCTION_HOSTS.includes(new URL(baseURL).hostname), 'store journeys never run against production');
    await page.addInitScript((startLang) => {
      window.localStorage.setItem('dp_store_preview', '1');
      if (!window.localStorage.getItem('dp_lang')) window.localStorage.setItem('dp_lang', startLang);
      if (!window.localStorage.getItem('dp_cookie_consent_v1')) {
        window.localStorage.setItem('dp_cookie_consent_v1', JSON.stringify({
          version: 1, updatedAt: new Date().toISOString(), choices: { essential: true, analytics: false },
        }));
      }
    }, lang);
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

// The first bookable day that still has a slot with room for the party
// (which day that is depends on today's date), then its first such slot.
export async function pickDeparture(panel, { otherThanSelected = false } = {}) {
  expect(await findDayWithSlot(panel, /./, { otherThanSelected }), 'a day with a bookable slot').not.toBeNull();
  await panel.locator('.slot-grid__slot:not(.is-soldout):not([disabled])').first().click();
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
// Patches the first trip, or the first trip for `experienceId` when given.
export async function editStoredCart(page, patchItem, experienceId = null) {
  await page.evaluate(([key, patch, target]) => {
    const cart = JSON.parse(window.localStorage.getItem(key));
    const index = target ? cart.items.findIndex((item) => item.experienceId === target) : 0;
    if (index < 0) throw new Error(`no stored trip for ${target}`);
    cart.items[index] = { ...cart.items[index], ...patch };
    window.localStorage.setItem(key, JSON.stringify(cart));
  }, [CART_STORAGE_KEY, patchItem, experienceId]);
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
    // A money amount in any store language: $135.00, 135,00 $, 135,00 USD.
    return lines.length > 0 && lines.every((line) => /\d[.,]\d{2}/.test(line.price));
  }, { message: 'every line shows a price' }).toBe(true);
  return lines;
}

// A slot label ("2:30 PM" in English, "14:30" in German/Polish) -> the
// stored cart time ("14:30").
export function slotLabelTo24h(label) {
  const [, hour, minute, half] = label.match(/(\d{1,2}):(\d{2})(?:\s*([AP]M))?/i);
  const hours = half ? (Number(hour) % 12) + (half.toUpperCase() === 'PM' ? 12 : 0) : Number(hour);
  return `${String(hours).padStart(2, '0')}:${minute}`;
}

// Walks the bookable days (this month, then the next ones) until one has a slot
// whose status text matches `wanted` next to a slot that can be booked now.
// Returns the wanted slot's 24h time, leaving that day selected; null if the
// window has no such day (e.g. a deployed inventory with nothing sold out).
// `otherThanSelected` skips the day selected when the search starts.
export async function findDayWithSlot(panel, wanted, { otherThanSelected = false } = {}) {
  const selected = panel.locator('.avail-cal__day.is-selected');
  const skip = otherThanSelected && await selected.count() ? await selected.getAttribute('aria-label') : null;
  // Three steps: the panel itself may move on from an empty month once it loads.
  for (let month = 0; month < 3; month += 1) {
    await expect(panel.locator('.avail-cal.is-loading')).toHaveCount(0);
    const days = panel.locator('.avail-cal__day:not([disabled])');
    for (let i = 0; i < await days.count(); i += 1) {
      const label = await days.nth(i).getAttribute('aria-label');
      if (label === skip) continue;
      // Click until the day is selected: the calendar can still be settling.
      const day = panel.getByRole('button', { name: label, exact: true });
      await expect(async () => {
        await day.click();
        await expect(day).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 });
      }).toPass();
      const slots = panel.locator('.slot-grid__slot');
      await expect(slots.first()).toBeVisible();
      const match = slots.filter({ has: panel.page().locator('.slot-grid__sub', { hasText: wanted }) }).first();
      if (await match.count() && await panel.locator('.slot-grid__slot:not([disabled])').count()) {
        return slotLabelTo24h(await match.locator('.slot-grid__time').innerText());
      }
    }
    await expect(panel.locator('.avail-cal.is-loading')).toHaveCount(0);
    const next = panel.getByRole('button', { name: 'Next month' });
    if (!await next.isEnabled()) break;
    await next.click();
  }
  return null;
}
