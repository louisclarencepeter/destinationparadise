// Editing and removing trips (HANDOFF.md "Required testing → Customer
// journey": "edit and remove one trip without changing the others"). Each
// trip keeps its own date, time, guests and price; changing or deleting one
// must leave every other line exactly as it was, through checkout.
import { expect, test } from '@playwright/test';
import {
  addTrip, dismissCookieBanner, openPricedCart, pickDeparture, prepareStorePage, readPricedLines, usd,
} from './helpers.js';

prepareStorePage();

const SAFARI = 'Safari Blue';
const SPICE = 'Spice Tour';
const CITY = 'Historical City Tour';

const guestsIn = (line) => Number(line.meta.match(/(\d+) guests?/)[1]);
const cents = (amount) => Math.round(amount * 100);
const depositOf = (subtotal) => Math.ceil(cents(subtotal) / 5) / 100;
const byTitle = (lines, title) => lines.find((line) => line.title === title);

async function expectTotalsMatchLines(lines, subtotalText, depositText) {
  const sum = lines.reduce((total, line) => total + usd(line.price), 0);
  const subtotal = usd(subtotalText);
  expect(cents(subtotal)).toBe(cents(sum));
  expect(usd(depositText)).toBe(depositOf(subtotal));
  return subtotal;
}

test('editing one trip and removing another leaves the rest untouched', async ({ page }) => {
  await addTrip(page, { slug: 'safari-blue' });
  await addTrip(page, { slug: 'spice-tour' });
  await addTrip(page, { slug: 'stone-town' });
  await page.reload();
  await dismissCookieBanner(page);

  let drawer = await openPricedCart(page);
  const before = await readPricedLines(drawer);
  expect(before.map((line) => line.title)).toEqual([SAFARI, SPICE, CITY]);

  // Edit Spice Tour: one more guest and a different day.
  await drawer.locator('.cart-item', { hasText: SPICE }).getByRole('button', { name: 'Edit' }).click();
  await expect(page).toHaveURL(/\/excursions\/spice-tour\?edit=/);
  const panel = page.locator('.booking-panel');
  await expect(panel.locator('.slot-grid__slot.is-selected')).toBeVisible();
  await panel.getByRole('button', { name: 'More guests' }).click();
  await pickDeparture(panel, { otherThanSelected: true });
  await panel.getByRole('button', { name: 'Update trip' }).click();

  drawer = page.locator('.cart-drawer.is-open');
  const edited = await readPricedLines(drawer);
  expect(edited.map((line) => line.title)).toEqual([SAFARI, SPICE, CITY]);
  expect(byTitle(edited, SAFARI)).toEqual(byTitle(before, SAFARI));
  expect(byTitle(edited, CITY)).toEqual(byTitle(before, CITY));
  const spiceBefore = byTitle(before, SPICE);
  const spiceAfter = byTitle(edited, SPICE);
  expect(guestsIn(spiceAfter)).toBe(guestsIn(spiceBefore) + 1);
  expect(spiceAfter.meta.split(' | ')[0]).not.toBe(spiceBefore.meta.split(' | ')[0]);

  // Remove Safari Blue: the edited Spice Tour and the untouched city tour stay.
  await drawer.locator('.cart-item', { hasText: SAFARI }).getByRole('button', { name: 'Remove' }).click();
  await expect(drawer).toContainText('2 experiences');
  const remaining = await readPricedLines(drawer);
  expect(remaining).toEqual([spiceAfter, byTitle(before, CITY)]);
  const totals = drawer.locator('.cart-drawer__subtotal strong');
  await expect(totals).toHaveCount(2);
  const subtotal = await expectTotalsMatchLines(remaining, await totals.nth(0).innerText(), await totals.nth(1).innerText());

  // Survives a refresh.
  await page.reload();
  await dismissCookieBanner(page);
  drawer = await openPricedCart(page);
  expect(await readPricedLines(drawer)).toEqual(remaining);

  // Checkout and confirmation carry exactly the two remaining trips.
  await drawer.getByRole('button', { name: 'Continue to checkout' }).click();
  await expect(page).toHaveURL(/\/store\/checkout$/);
  const pay = page.getByRole('button', { name: /^Pay .*deposit/ });
  await expect(pay).toContainText(`$${depositOf(subtotal)}`);
  const checkoutLines = await readPricedLines(page.locator('.store-checkout'), 'checkout-line');
  expect(checkoutLines.map((line) => line.title)).toEqual([SPICE, CITY]);

  await page.locator('#checkout-name').fill('E2E Cart Guest');
  await page.locator('#checkout-email').fill('e2e-store@example.com');
  await page.locator('#checkout-phone').fill('+255777000000');
  await pay.click();
  await expect(page).toHaveURL(/\/store\/order\/DP-\d{4}-\w+/, { timeout: 30_000 });
  const confirmation = page.locator('main');
  await expect(confirmation.getByText(/CONF · [A-Z]{2}-\w+/)).toHaveCount(2);
  await expect(confirmation).toContainText(SPICE);
  await expect(confirmation).toContainText(CITY);
  await expect(confirmation).not.toContainText(SAFARI);
  await expect(confirmation).toContainText(`$${depositOf(subtotal)}`);
});

test('editing a trip from checkout returns there with a fresh price', async ({ page }) => {
  await addTrip(page, { slug: 'safari-blue' });
  await addTrip(page, { slug: 'spice-tour' });
  await page.goto('/store/checkout');
  await dismissCookieBanner(page);
  const pay = page.getByRole('button', { name: /^Pay .*deposit/ });
  await expect(pay).toBeVisible();
  const checkout = page.locator('.store-checkout');
  const before = await readPricedLines(checkout, 'checkout-line');

  await checkout.locator('.checkout-line', { hasText: SAFARI }).locator('.checkout-line__fix').click();
  await expect(page).toHaveURL(/\/excursions\/safari-blue\?edit=/);
  const panel = page.locator('.booking-panel');
  await expect(panel.locator('.slot-grid__slot.is-selected')).toBeVisible();
  await panel.getByRole('button', { name: 'More guests' }).click();
  // The saved time is dropped if it no longer has room for the bigger party.
  if (await panel.locator('.slot-grid__slot.is-selected').count() === 0) await pickDeparture(panel);
  await panel.getByRole('button', { name: 'Save & checkout' }).click();

  await expect(page).toHaveURL(/\/store\/checkout$/);
  await expect(pay).toBeVisible();
  const after = await readPricedLines(checkout, 'checkout-line');
  expect(after.map((line) => line.title)).toEqual([SAFARI, SPICE]);
  expect(guestsIn(byTitle(after, SAFARI))).toBe(guestsIn(byTitle(before, SAFARI)) + 1);
  expect(byTitle(after, SPICE)).toEqual(byTitle(before, SPICE));

  const totals = checkout.locator('.checkout-total strong');
  await expect(totals).toHaveCount(3);
  const subtotal = await expectTotalsMatchLines(after, await totals.nth(0).innerText(), await totals.nth(1).innerText());
  await expect(pay).toContainText(`$${depositOf(subtotal)}`);
});

test('removing the last trip empties the cart and closes checkout', async ({ page }) => {
  await addTrip(page, { slug: 'safari-blue' });
  const drawer = page.locator('.cart-drawer.is-open');
  await drawer.locator('.cart-item', { hasText: SAFARI }).getByRole('button', { name: 'Remove' }).click();
  await expect(drawer).toContainText('Your trip is empty.');
  await expect(page.locator('.cart-nav-btn').first()).not.toContainText(/\d/);

  await page.goto('/store/checkout');
  await expect(page).toHaveURL(/\/store$/);
  await page.reload();
  await expect(page.locator('.cart-nav-btn').first()).not.toContainText(/\d/);
});
