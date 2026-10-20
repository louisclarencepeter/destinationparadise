// Locale-aware label helpers for store dates and times. All inputs are plain
// wall-clock values in the store timezone ('YYYY-MM-DD' / 'HH:MM'); we format
// them as-is and never convert zones in the browser.

export function formatTimeLabel(lang, time) {
  const [hour, minute] = time.split(':').map(Number);
  return new Intl.DateTimeFormat(lang, { hour: 'numeric', minute: '2-digit' })
    .format(new Date(2000, 0, 1, hour, minute));
}

export function formatDateLabel(lang, dateIso, options = {}) {
  const [year, month, day] = dateIso.split('-').map(Number);
  return new Intl.DateTimeFormat(lang, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(year, month - 1, day));
}

export function formatMonthLabel(lang, monthIso) {
  const [year, month] = monthIso.split('-').map(Number);
  return new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' })
    .format(new Date(year, month - 1, 1));
}

export function monthIsoOf(dateIso) {
  return dateIso.slice(0, 7);
}

export function shiftMonthIso(monthIso, delta) {
  const [year, month] = monthIso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

// Sunday-start weeks for English, Monday-start for German/Polish.
export function weekStartFor(lang) {
  return (lang || 'en').split('-')[0] === 'en' ? 0 : 1;
}

export function weekdayLabels(lang, weekStart) {
  const formatter = new Intl.DateTimeFormat(lang, { weekday: 'short' });
  // 2023-01-01 was a Sunday; index 0 = Sunday.
  return Array.from({ length: 7 }, (_, index) => {
    const dow = (weekStart + index) % 7;
    return formatter.format(new Date(2023, 0, 1 + dow));
  });
}
