// Expected store copy and formatting per language, read from the same locale
// files the app ships, so the specs follow copy edits but still catch a page
// that shows the wrong language, a raw key or an English fallback.
import { readFileSync } from 'node:fs';

export const STORE_LANGUAGES = ['en', 'de', 'pl'];

// Minimal i18next-style lookup: dotted key, `_one/_few/_many/_other` plural
// suffixes chosen by CLDR rules, {{var}} interpolation, <tag> markup dropped.
export function storeCopy(lang) {
  const dict = JSON.parse(readFileSync(new URL(`../src/locales/${lang}/store.json`, import.meta.url), 'utf8'));
  const plural = new Intl.PluralRules(lang);
  const get = (path) => path.split('.').reduce((node, part) => node?.[part], dict);
  return (key, vars = {}) => {
    const text = 'count' in vars
      ? get(`${key}_${plural.select(vars.count)}`) ?? get(`${key}_other`) ?? get(key)
      : get(key);
    if (typeof text !== 'string') throw new Error(`no ${lang} copy for ${key}`);
    let plainText = text.replace(/\{\{(\w+)\}\}/g, (_, name) => String(vars[name]));
    let previous;
    // Removing one tag can expose another; keep stripping until stable.
    do {
      previous = plainText;
      plainText = plainText.replace(/<[^>]+>/g, '');
    } while (plainText !== previous);
    return plainText;
  };
}

// What Chromium's Intl produces for USD amounts and times in each language
// (en "$1,234.50" / "8:30 AM", de "1.234,50 $" / "8:30", pl "1234,50 USD" /
// "8:30"), plus the short weekday a store date label starts with.
// `\s` covers the narrow/no-break spaces Intl puts in these strings.
export const STORE_FORMATS = {
  en: {
    money: /^\$\d{1,3}(?:,\d{3})*\.\d{2}$/,
    parse: (text) => Number(text.replace(/[^\d.]/g, '')),
    time: /\b\d{1,2}:\d{2}\s[AP]M\b/,
    weekday: /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),/,
  },
  de: {
    money: /^\d{1,3}(?:\.\d{3})*,\d{2}\s\$$/,
    parse: (text) => Number(text.replace(/[^\d,]/g, '').replace(',', '.')),
    time: /\b\d{1,2}:\d{2}\b(?!\s?[AP]M)/,
    weekday: /\b(?:Mo|Di|Mi|Do|Fr|Sa|So)\.,/,
  },
  pl: {
    money: /^\d{1,3}(?:\s?\d{3})*,\d{2}\sUSD$/,
    parse: (text) => Number(text.replace(/[^\d,]/g, '').replace(',', '.')),
    time: /\b\d{1,2}:\d{2}\b(?!\s?[AP]M)/,
    weekday: /\b(?:pon|wt|śr|czw|pt|sob|niedz)\.,/,
  },
};

// i18n keys as they would leak if a translation lookup failed.
export const RAW_KEY = /\b(?:store:)?(?:panel|cart|checkout|confirm|pickup|pricing|guests|payment|meta)\.[a-z_]+(?:\.[a-z_]+)*\b/;
