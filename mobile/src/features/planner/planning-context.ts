export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export type PlanningPreferences = {
  month: string;
  nights: number;
  adults: number;
  children: number;
  budget: string;
  pace: string;
  interests: string[];
  tripStyle: string;
  destinationId: string | null;
};

export function normalizeMonth(value?: string) {
  return MONTH_NAMES.find((month) => month.toLowerCase() === value?.toLowerCase() || month.slice(0, 3).toLowerCase() === value?.toLowerCase());
}

export function preferenceSummary(preferences: PlanningPreferences, destinationName?: string) {
  return `${preferences.nights} nights in ${normalizeMonth(preferences.month) || preferences.month} · ${preferences.adults} ${preferences.adults === 1 ? 'adult' : 'adults'}${preferences.children ? ` + ${preferences.children} ${preferences.children === 1 ? 'child' : 'children'}` : ''}${destinationName ? ` · ${destinationName}` : ''}`;
}

export function planningContext(preferences: PlanningPreferences, destinationName?: string) {
  const month = normalizeMonth(preferences.month) || preferences.month;
  const rainySeason = ['March', 'April', 'May', 'November'].includes(month);
  return [
    'Current preferences; supersede earlier versions:',
    `${month}; ${preferences.nights} nights; ${preferences.adults} adults, ${preferences.children} children. Dates/year unconfirmed.`,
    `${preferences.budget} budget; ${preferences.pace} pace; ${preferences.tripStyle || 'open style'}.`,
    `Interests: ${preferences.interests.join(', ') || 'open'}. Around: ${destinationName || 'Zanzibar and/or Tanzania'}.`,
    `Website seasonal guide: ${rainySeason ? 'rainy / low hotel season; allow for rain and closures' : 'high or peak hotel season; weather is not guaranteed'}.`,
    `If drafting days, ${preferences.nights} nights means ${preferences.nights + 1} days. Count overnight stays explicitly.`,
    'Suggestions only; no invented exact dates, confirmed prices, availability or bookings. Nothing has been emailed. A human quote is requested separately in the app.',
  ].join('\n');
}

export function quoteValidation(contact: { name: string; email: string; phone: string }, consent: boolean) {
  if (contact.name.trim().length < 2) return 'Enter your name so our team knows who to contact.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) return 'Enter a valid email address.';
  if (!consent) return 'Please agree to share this conversation and your contact details with our team.';
  return null;
}
