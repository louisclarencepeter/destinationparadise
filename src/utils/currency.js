// Currency localization helpers.
//
// All product prices in the data layer are authored as plain USD numbers.
// We pick a display currency from the active UI language (German → EUR,
// Polish → PLN, everything else → USD), convert with live exchange rates,
// and format with Intl so each locale gets its native presentation
// (e.g. "$1,890", "1.750 €", "7 600 zł").

export const DEFAULT_CURRENCY = 'USD';

// Map an i18n language code to the currency it should be priced in.
export const LANG_TO_CURRENCY = {
  de: 'EUR',
  pl: 'PLN',
};

// Per-currency presentation locale (controls grouping/symbol placement).
export const CURRENCY_META = {
  USD: { locale: 'en-US' },
  EUR: { locale: 'de-DE' },
  PLN: { locale: 'pl-PL' },
};

// Static USD-based fallback rates, used before live rates load or if the
// FX request fails. Kept deliberately conservative; refresh occasionally.
export const FALLBACK_RATES = { USD: 1, EUR: 0.92, PLN: 4.0 };

const RATES_ENDPOINT = 'https://open.er-api.com/v6/latest/USD';
const RATES_CACHE_KEY = 'dp_fx_rates';
const RATES_TTL = 24 * 60 * 60 * 1000; // 24h
const RATES_FETCH_TIMEOUT = 8000; // abort a hung FX request after 8s

// A live rate must be positive and within a sane multiple of our fallback,
// so a malformed-but-numeric response (e.g. 0, or a wildly off value) can't
// produce nonsense prices.
function isSaneRate(value, currency) {
  const ref = FALLBACK_RATES[currency];
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    && value >= ref / 4 && value <= ref * 4;
}

export function currencyForLang(lang) {
  const base = (lang || '').split('-')[0];
  return LANG_TO_CURRENCY[base] || DEFAULT_CURRENCY;
}

// Round converted amounts to tidy marketing numbers. The base USD prices are
// already "nice", so we only round the converted (EUR/PLN) figures.
function roundNice(value) {
  const abs = Math.abs(value);
  let step;
  if (abs >= 2000) step = 100;
  else if (abs >= 500) step = 50;
  else if (abs >= 100) step = 10;
  else if (abs >= 20) step = 5;
  else step = 1;
  return Math.round(value / step) * step;
}

export function convert(usdValue, currency, rates) {
  const rate = (rates && rates[currency]) ?? FALLBACK_RATES[currency] ?? 1;
  return Number(usdValue) * rate;
}

// Format a USD amount in the target currency. `round` defaults to true but is
// ignored for USD so authored prices ($1,890) are shown exactly.
export function formatPrice(usdValue, currency, rates, { round = true } = {}) {
  const num = Number(usdValue);
  if (!Number.isFinite(num)) return '';
  const converted = convert(num, currency, rates);
  const display = round && currency !== DEFAULT_CURRENCY ? roundNice(converted) : converted;
  const { locale } = CURRENCY_META[currency] || CURRENCY_META[DEFAULT_CURRENCY];
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(display);
}

export function getCachedRates() {
  try {
    const raw = window.localStorage.getItem(RATES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.rates) return null;
    // Return cached rates even if slightly stale; freshness is best-effort.
    return parsed.rates;
  } catch {
    return null;
  }
}

export function isCacheFresh() {
  try {
    const raw = window.localStorage.getItem(RATES_CACHE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.ts) && Date.now() - parsed.ts < RATES_TTL;
  } catch {
    return false;
  }
}

function cacheRates(rates) {
  try {
    window.localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ ts: Date.now(), rates }));
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
}

export async function fetchRates() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RATES_FETCH_TIMEOUT);
  let res;
  try {
    res = await fetch(RATES_ENDPOINT, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error(`FX request failed: ${res.status}`);
  const data = await res.json();
  const r = data && data.rates;
  if (!r || !isSaneRate(r.EUR, 'EUR') || !isSaneRate(r.PLN, 'PLN')) {
    throw new Error('FX response malformed');
  }
  const rates = { USD: 1, EUR: r.EUR, PLN: r.PLN };
  cacheRates(rates);
  return rates;
}
