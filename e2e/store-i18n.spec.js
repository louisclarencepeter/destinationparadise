// The purchase journey in English, German and Polish (HANDOFF.md "Required
// testing → Customer journey": "validate English, German, and Polish copy and
// formatting"). Every label the test clicks or expects comes from that
// language's locale file; amounts, times and dates must use that language's
// format; and no page may show a raw i18n key or an English fallback.
import { expect, test } from '@playwright/test';
import { fillPickup, findDayWithSlot, openBookingPanel, prepareStorePage, readPricedLines } from './helpers.js';
import { RAW_KEY, STORE_FORMATS, STORE_LANGUAGES, storeCopy } from './i18n.js';

const english = storeCopy('en');

// English strings the journey shows; for de/pl each must be replaced.
const ENGLISH_ONLY = [
  'panel.add', 'cart.title', 'cart.checkout_cta', 'cart.status_available', 'cart.mode_shared',
  'checkout.trip_total', 'confirm.deposit_chip', 'checkout.errors.name_required',
].map((key) => english(key));

// Polish has separate plural forms for 2–4 and 5+ guests.
const TRIPS = [
  { slug: 'safari-blue', guests: 5 },
  { slug: 'spice-tour', guests: 2 },
];

// Pinned independently of the locale files, so a wrong plural form in the
// copy itself is caught too (the locale-driven checks only prove wiring).
const GUEST_COUNTS = {
  en: { 5: '5 guests', 2: '2 guests', 3: '3 guests' },
  de: { 5: '5 Gäste', 2: '2 Gäste', 3: '3 Gäste' },
  pl: { 5: '5 gości', 2: '2 goście', 3: '3 goście' },
};

const cents = (amount) => Math.round(amount * 100);
const depositOf = (subtotal) => Math.ceil(cents(subtotal) / 5) / 100;

async function expectCleanCopy(page, lang) {
  const text = await page.locator('body').innerText();
  expect(text, 'raw i18n key on the page').not.toMatch(RAW_KEY);
  if (lang === 'en') return;
  for (const phrase of ENGLISH_ONLY) expect(text, `English fallback "${phrase}"`).not.toContain(phrase);
}

async function setGuests(panel, t, guests) {
  const value = panel.locator('.guest-picker__value');
  const more = panel.getByRole('button', { name: t('guests.increase') });
  const fewer = panel.getByRole('button', { name: t('guests.decrease') });
  while (Number(await value.innerText()) < guests) await more.click();
  while (Number(await value.innerText()) > guests) await fewer.click();
  await expect(value).toHaveText(String(guests));
}

for (const lang of STORE_LANGUAGES) {
  test.describe(`in ${lang}`, () => {
    prepareStorePage(lang);
    const t = storeCopy(lang);
    const fmt = STORE_FORMATS[lang];

    test('books two experiences with localized copy and formats', async ({ page }) => {
      await page.goto('/store');
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page).toHaveTitle(t('meta.title'));
      await expectCleanCopy(page, lang);

      for (const trip of TRIPS) {
        const panel = await openBookingPanel(page, trip.slug);
        await setGuests(panel, t, trip.guests);
        await fillPickup(panel);
        const zone = await panel.locator('select[name="pickupZone"]').inputValue();
        await expect(panel.locator('select[name="pickupZone"] option:checked')).toHaveText(t(`pickup.zones.${zone}`));
        trip.zone = zone;
        expect(await findDayWithSlot(panel, /./)).not.toBeNull();
        await panel.locator('.slot-grid__slot:not([disabled])').first().click();
        await expectCleanCopy(page, lang);
        await panel.getByRole('button', { name: t('panel.add') }).click();
        await expect(page.locator('.cart-drawer.is-open')).toBeVisible();
      }

      // Cart drawer: titles, plurals, statuses and money in this language.
      await page.reload();
      await page.locator('.cart-nav-btn').first().click();
      const drawer = page.locator('.cart-drawer.is-open');
      await expect(drawer.locator('.cart-drawer__title')).toHaveText(t('cart.title'));
      await expect(drawer.locator('.cart-drawer__sub')).toHaveText(t('cart.subhead', { count: TRIPS.length }));
      const lines = await readPricedLines(drawer);
      expect(lines).toHaveLength(TRIPS.length);
      for (const [index, trip] of TRIPS.entries()) {
        const line = lines[index];
        const [when, who, pickup] = line.meta.split(' | ');
        expect(when).toMatch(fmt.weekday);
        expect(when).toMatch(fmt.time);
        expect(who).toBe(`${t('cart.guest_count', { count: trip.guests })} · ${t('cart.mode_shared')}`);
        expect(who.split(' · ')[0]).toBe(GUEST_COUNTS[lang][trip.guests]);
        expect(pickup).toBe(`${t(`pickup.zones.${trip.zone}`)} · E2E Beach Hotel`);
        expect(line.price).toMatch(fmt.money);
      }
      await expect(drawer.locator('.cart-item__status')).toHaveText(TRIPS.map(() => t('cart.status_available')));
      const totals = drawer.locator('.cart-drawer__subtotal');
      await expect(totals).toHaveCount(2);
      const subtotalText = await totals.nth(0).locator('strong').innerText();
      const depositText = await totals.nth(1).locator('strong').innerText();
      expect(subtotalText).toMatch(fmt.money);
      expect(depositText).toMatch(fmt.money);
      const subtotal = fmt.parse(subtotalText);
      expect(cents(subtotal)).toBe(cents(lines.reduce((sum, line) => sum + fmt.parse(line.price), 0)));
      expect(fmt.parse(depositText)).toBe(depositOf(subtotal));
      await expect(totals.nth(1).locator('span').first()).toHaveText(t('checkout.deposit_due', { percent: 20 }));
      await expectCleanCopy(page, lang);

      // Checkout: the pay button carries the same formatted deposit.
      await drawer.getByRole('button', { name: t('cart.checkout_cta') }).click();
      await expect(page).toHaveURL(/\/store\/checkout$/);
      const pay = page.getByRole('button', { name: t('checkout.pay_deposit', { amount: depositText }) });
      await expect(pay).toBeEnabled();
      await expect(page.locator('.store-checkout__title')).toHaveText(t('checkout.title'));
      await expect(page.locator('.checkout-total span').first()).toHaveText(t('checkout.trip_total'));
      await expect(page.locator('.checkout-total strong').first()).toHaveText(subtotalText);

      await pay.click();
      const errors = page.locator('.checkout-field__error');
      await expect(errors.first()).toBeVisible();
      await expect(errors).toHaveText([t('checkout.errors.name_required'), t('checkout.errors.email_required')]);
      await expectCleanCopy(page, lang);

      await page.locator('#checkout-name').fill('E2E Locale Guest');
      await page.locator('#checkout-email').fill('e2e-store@example.com');
      await page.locator('#checkout-phone').fill('+255777000000');
      await pay.click();

      // Confirmation: localized lead with the reference, chips and deposit.
      await expect(page).toHaveURL(/\/store\/order\/DP-\d{4}-\w+/, { timeout: 30_000 });
      const reference = page.url().match(/(DP-\d{4}-\w+)/)[1];
      const confirmation = page.locator('main');
      await expect(confirmation).toContainText(t('confirm.deposit_lead', { reference }));
      await expect(confirmation.getByText(t('confirm.deposit_chip'), { exact: true })).toHaveCount(TRIPS.length);
      await expect(confirmation).toContainText(depositText);
      await expectCleanCopy(page, lang);
    });
  });
}

test.describe('switching language', () => {
  prepareStorePage('en');

  test('keeps the cart and re-renders it in the new language', async ({ page }) => {
    const de = storeCopy('de');
    const panel = await openBookingPanel(page, 'safari-blue');
    await setGuests(panel, english, 3);
    await fillPickup(panel);
    expect(await findDayWithSlot(panel, /./)).not.toBeNull();
    await panel.locator('.slot-grid__slot:not([disabled])').first().click();
    await panel.getByRole('button', { name: english('panel.add') }).click();
    const drawer = page.locator('.cart-drawer.is-open');
    const [before] = await readPricedLines(drawer);
    expect(before.price).toMatch(STORE_FORMATS.en.money);
    await drawer.getByRole('button', { name: english('cart.close') }).click();

    // The header switcher on desktop, the one in the menu on phones.
    let toggle = page.locator('.nav__lang .lang-switcher__toggle');
    if (!await toggle.isVisible()) {
      await page.locator('.nav__burger').click();
      toggle = page.locator('.mm-menu__lang .lang-switcher__toggle');
    }
    await toggle.click();
    await page.locator('.lang-switcher__option:visible', { hasText: 'DE' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    const menuClose = page.locator('.mm-menu.is-open .mm-menu__close');
    if (await menuClose.isVisible()) await menuClose.click();

    // Same trip and amount, now in German; still German after a reload.
    for (let pass = 0; pass < 2; pass += 1) {
      await page.locator('.cart-nav-btn').first().click();
      await expect(drawer.locator('.cart-drawer__title')).toHaveText(de('cart.title'));
      const [after] = await readPricedLines(drawer);
      expect(after.title).toBe(before.title);
      expect(after.meta).toContain(`${de('cart.guest_count', { count: 3 })} · ${de('cart.mode_shared')}`);
      expect(after.meta).toContain(GUEST_COUNTS.de[3]);
      expect(after.meta).toMatch(STORE_FORMATS.de.weekday);
      expect(after.price).toMatch(STORE_FORMATS.de.money);
      expect(STORE_FORMATS.de.parse(after.price)).toBe(STORE_FORMATS.en.parse(before.price));
      await expectCleanCopy(page, 'de');
      if (pass === 0) await page.reload();
    }
  });
});
