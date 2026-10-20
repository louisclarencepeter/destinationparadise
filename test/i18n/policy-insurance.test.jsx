import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import Policy from '../../src/pages/Policy.jsx';

async function renderPolicy(language, section) {
  const policy = JSON.parse(readFileSync(new URL(`../../src/locales/${language}/policy.json`, import.meta.url), 'utf8'));
  const i18n = createInstance();
  await i18n.init({ lng: language, resources: { [language]: { policy } }, interpolation: { escapeValue: false } });
  const html = renderToStaticMarkup(
    createElement(I18nextProvider, { i18n },
      createElement(MemoryRouter, null, createElement(Policy, { section }))),
  );
  return { html, policy };
}

describe.each(['en', 'de', 'pl'])('%s policy rendering', (language) => {
  it('renders linked insurance table cells alongside the existing cancellation tables', async () => {
    const { html } = await renderPolicy(language, 'booking');
    expect(html).toContain('id="travel-insurance"');
    expect(html).toMatch(/<a href="https:\/\/inbound\.nicinsurance\.co\.tz\/">[^<]+<\/a>/);
    expect(html).toMatch(/<a href="https:\/\/inbound\.visitzanzibar\.go\.tz\/">[^<]+<\/a>/);
    expect(html).toMatch(/USD 44|44 USD/);
    expect(html).toMatch(/USD 22|22 USD/);
    expect(html.match(/<table>/g)).toHaveLength(3);
    expect(html).toContain('scope="col"');
    expect(html).toContain('scope="row"');
    expect(html).toContain('tabindex="0" role="region" aria-label=');
    expect(html).not.toContain('[object Object]');
    expect(html).toMatch(/50\s*%/);
    expect(html).toMatch(/100\s*%/);
  });

  it('links the terms to the insurance section and dates only the updated policies', async () => {
    const terms = await renderPolicy(language, 'terms');
    const booking = await renderPolicy(language, 'booking');
    const privacy = await renderPolicy(language, 'privacy');
    expect(terms.html).toContain('href="/booking-policy#travel-insurance"');
    expect(terms.html).toContain(`<dd>${terms.policy.policies.terms.last_updated_value}</dd>`);
    expect(booking.html).toContain(`<dd>${booking.policy.policies.booking.last_updated_value}</dd>`);
    expect(privacy.html).toContain(`<dd>${privacy.policy.meta.last_updated_value}</dd>`);
    expect(privacy.html).not.toContain('id="travel-insurance"');
  });
});
