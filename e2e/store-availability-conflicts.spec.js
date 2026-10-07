// A departure that fills up after it was added (HANDOFF.md "Required testing →
// Customer journey": "surface a sold-out conflict for only the affected
// item"). The cart keeps both trips, flags only the one that changed, blocks
// payment until it is fixed, and then books both.
//
// The sold-out departure is found through the calendar rather than invented,
// so the same steps work on local fixtures and on a deployed inventory.
import { expect, test } from '@playwright/test';
import {
  addTrip, dismissCookieBanner, editStoredCart, fillPickup, findDayWithSlot, openBookingPanel,
  pickDeparture, prepareStorePage, readPricedLines, trackPaymentRequests,
} from './helpers.js';

prepareStorePage();

const SPICE = 'Spice Tour';
const CITY = 'Historical City Tour';

const CASES = [
  {
    name: 'sells out',
    slotText: /^Sold out$/,
    patch: (time) => ({ time }),
    status: 'No longer available',
  },
  {
    name: 'no longer has room for the party',
    slotText: /^[12] left$/,
    patch: (time) => ({ time, guests: 3 }),
    status: 'Not enough places left',
  },
];

for (const { name, slotText, patch, status } of CASES) {
  test(`a departure that ${name} is flagged on its own and can be fixed`, async ({ page }) => {
    const paymentCalls = trackPaymentRequests(page);

    // The untouched trip.
    await addTrip(page, { slug: 'spice-tour' });

    // A city tour on a day that also has the departure we will "lose".
    const panel = await openBookingPanel(page, 'stone-town');
    await fillPickup(panel);
    const lostTime = await findDayWithSlot(panel, slotText);
    test.skip(!lostTime, `no departure in the booking window shows "${slotText.source}"`);
    await panel.locator('.slot-grid__slot:not([disabled])').first().click();
    await panel.getByRole('button', { name: 'Add to my trip' }).click();
    await expect(page.locator('.cart-drawer.is-open')).toBeVisible();

    // Record the healthy cart, then let the city tour's departure fill up.
    await page.reload();
    await dismissCookieBanner(page);
    await page.locator('.cart-nav-btn').first().click();
    const drawer = page.locator('.cart-drawer.is-open');
    const healthy = await readPricedLines(drawer);
    const spice = healthy.find((line) => line.title === SPICE);
    await editStoredCart(page, patch(lostTime), 'stone-town');

    // Cart: only the city tour is flagged; the Spice Tour keeps its price.
    await page.locator('.cart-nav-btn').first().click();
    const city = drawer.locator('.cart-item', { hasText: CITY });
    await expect(city.locator('.cart-item__status')).toHaveText(status);
    await expect(city).toHaveClass(/cart-item--blocked/);
    const spiceItem = drawer.locator('.cart-item', { hasText: SPICE });
    await expect(spiceItem.locator('.cart-item__status')).toHaveText('Available');
    await expect(spiceItem).not.toHaveClass(/cart-item--blocked/);
    await expect(spiceItem.locator('.cart-item__price')).toHaveText(spice.price);
    await expect(drawer.locator('.cart-drawer__subtotal')).toHaveCount(1);

    // Checkout: same split, and nothing can be paid.
    await page.goto('/store/checkout');
    await dismissCookieBanner(page);
    await expect(page.getByText('Some departures are no longer available. Please adjust the highlighted trips.')).toBeVisible();
    const checkout = page.locator('.store-checkout');
    await expect(checkout.locator('.checkout-line--conflict')).toHaveCount(1);
    const cityLine = checkout.locator('.checkout-line', { hasText: CITY });
    await expect(cityLine).toHaveClass(/checkout-line--conflict/);
    await expect(cityLine.locator('.checkout-line__fix')).toHaveText('Choose a new time');
    await expect(checkout.locator('.checkout-line', { hasText: SPICE }).locator('.checkout-line__price')).toHaveText(spice.price);
    await page.locator('#checkout-name').fill('E2E Conflict Guest');
    await page.locator('#checkout-email').fill('e2e-store@example.com');
    await page.locator('#checkout-phone').fill('+255777000000');
    await expect(page.locator('.checkout-pay')).toBeDisabled();
    expect(paymentCalls).toEqual([]);

    // Fix it: another departure the same day when one has room for the
    // party (on some dates none does), straight back to checkout.
    await cityLine.locator('.checkout-line__fix').click();
    const editPanel = page.locator('.booking-panel');
    await expect(editPanel.locator('.slot-grid__slot').first()).toBeVisible();
    await expect(editPanel.locator('.booking-panel__submit')).toBeDisabled();
    const sameDay = editPanel.locator('.slot-grid__slot:not([disabled])').first();
    if (await sameDay.count()) await sameDay.click();
    else await pickDeparture(editPanel);
    await editPanel.getByRole('button', { name: 'Save & checkout' }).click();

    await expect(page).toHaveURL(/\/store\/checkout$/);
    const pay = page.getByRole('button', { name: /^Pay .*deposit/ });
    await expect(pay).toBeEnabled();
    await expect(checkout.locator('.checkout-line--conflict')).toHaveCount(0);
    const fixed = await readPricedLines(checkout, 'checkout-line');
    expect(fixed.map((line) => line.title)).toEqual([SPICE, CITY]);
    expect(fixed.find((line) => line.title === SPICE).price).toBe(spice.price);

    // Contact details survive the round trip (or are re-entered) and both book.
    await page.locator('#checkout-name').fill('E2E Conflict Guest');
    await page.locator('#checkout-email').fill('e2e-store@example.com');
    await page.locator('#checkout-phone').fill('+255777000000');
    await pay.click();
    await expect(page).toHaveURL(/\/store\/order\/DP-\d{4}-\w+/, { timeout: 30_000 });
    await expect(page.locator('main').getByText(/CONF · [A-Z]{2}-\w+/)).toHaveCount(2);
  });
}
