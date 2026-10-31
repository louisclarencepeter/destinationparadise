// Quote-only selections never reach payment (docs/pesapal-store-launch.md,
// "Group-size and pickup pricing"): online booking covers 1–6 guests in a
// listed pickup area; larger groups and the "other" area need a Book Now
// enquiry. The panel must refuse them, and a cart that still holds one (an old
// or hand-edited browser cart) must keep checkout from charging anything.
import { expect, test } from '@playwright/test';
import {
  addTrip, dismissCookieBanner, editStoredCart, fillPickup, openBookingPanel, pickDeparture,
  prepareStorePage, trackPaymentRequests,
} from './helpers.js';

prepareStorePage();

const LARGE_GROUP_HINT = 'For 7 or more guests, use Book Now for a separate enquiry.';
const OTHER_AREA_HINT = 'This pickup area needs a separate enquiry through Book Now.';

// Every add/save action stays disabled and no price total is shown. (When
// editing from checkout the panel shows a single "save" action instead.)
async function expectPanelBlocked(panel) {
  await expect(panel.locator('.booking-panel__submit')).toBeDisabled();
  for (const action of await panel.locator('.booking-panel__checkout').all()) await expect(action).toBeDisabled();
  await expect(panel.locator('.booking-panel__total')).toHaveCount(0);
}

test('the booking panel stops at six guests', async ({ page }) => {
  const panel = await openBookingPanel(page, 'safari-blue');
  const more = panel.getByRole('button', { name: 'More guests' });
  while (await more.isEnabled()) await more.click();

  await expect(more).toBeDisabled();
  await expect(panel.locator('.guest-picker__value')).toHaveText('6');
  await fillPickup(panel);
  await pickDeparture(panel);
  await expect(panel.getByRole('button', { name: 'Add to my trip' })).toBeEnabled();
});

test('the "other" pickup area asks for an enquiry instead of a price', async ({ page }) => {
  const panel = await openBookingPanel(page, 'safari-blue');
  await fillPickup(panel, 'other');
  await pickDeparture(panel);

  await expect(panel).toContainText(OTHER_AREA_HINT);
  await expectPanelBlocked(panel);

  // Switching to a listed area makes the same departure bookable.
  await fillPickup(panel);
  await expect(panel.getByRole('button', { name: 'Add to my trip' })).toBeEnabled();
});

const CART_CASES = [
  { name: 'a group of 8', patch: { guests: 8 }, panelHint: LARGE_GROUP_HINT },
  { name: 'the "other" pickup area', patch: { pickupZone: 'other' }, panelHint: OTHER_AREA_HINT },
];

for (const { name, patch, panelHint } of CART_CASES) {
  test(`a saved cart with ${name} cannot be paid`, async ({ page }) => {
    const paymentCalls = trackPaymentRequests(page);

    // A payable trip next to the quote-only one: nothing may be charged,
    // not even a partial deposit for the payable trip.
    await addTrip(page, { slug: 'safari-blue' });
    await addTrip(page, { slug: 'spice-tour' });
    await editStoredCart(page, patch);

    await page.locator('.cart-nav-btn').first().click();
    const drawer = page.locator('.cart-drawer.is-open');
    await expect(drawer).toContainText('2 experiences');
    // Subtotal reads as unpriced and the 20% deposit row is withheld.
    await expect(drawer.locator('.cart-drawer__subtotal')).toHaveCount(1);
    await expect(drawer.locator('.cart-drawer__subtotal')).toContainText(/Priced on request|Online price unavailable/);

    await page.goto('/store/checkout');
    await dismissCookieBanner(page);
    await expect(page.getByText(/Payment remains unavailable until its price is confirmed/)).toBeVisible();
    await page.locator('#checkout-name').fill('E2E Quote Guest');
    await page.locator('#checkout-email').fill('e2e-store@example.com');
    await page.locator('#checkout-phone').fill('+255777000000');
    await expect(page.locator('.checkout-pay')).toBeDisabled();
    await expect(page.getByRole('button', { name: /^Pay .*deposit/ })).toHaveCount(0);

    // Editing the trip lands on a panel that still refuses the selection.
    await page.locator('.checkout-line__fix').first().click();
    const panel = page.locator('.booking-panel');
    // Wait for the saved day and its time slots to load, so "disabled" is the
    // pricing rule speaking and not a panel that is still loading. (An 8-guest
    // party also loses its time: no slot has that many seats.)
    await expect(panel.locator('.avail-cal__day.is-selected')).toBeVisible();
    await expect(panel.locator('.slot-grid__slot').first()).toBeVisible();
    await expect(panel).toContainText(panelHint);
    await expectPanelBlocked(panel);

    await expect(page).not.toHaveURL(/\/store\/order\//);
    expect(paymentCalls).toEqual([]);
  });
}
