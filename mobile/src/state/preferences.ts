export type TripPreferences = {
  month: string;
  nights: number;
  adults: number;
  children: number;
  budget: 'Value' | 'Mid-range' | 'Luxury';
  pace: 'Relaxed' | 'Balanced' | 'Active';
  interests: string[];
  tripStyle: string;
  destinationId: string | null;
};

export const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function createDefaultPreferences(date = new Date()): TripPreferences {
  return { month: new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'Africa/Dar_es_Salaam' }).format(date), nights: 9, adults: 2, children: 0, budget: 'Mid-range', pace: 'Balanced', interests: [], tripStyle: '', destinationId: null };
}

const boundedNumber = (value: unknown, fallback: number, min: number, max: number) => typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value : fallback;

export function normalizePreferences(value: unknown, fallback = createDefaultPreferences()): TripPreferences {
  const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    month: typeof raw.month === 'string' && monthNames.includes(raw.month) ? raw.month : fallback.month,
    nights: boundedNumber(raw.nights, fallback.nights, 1, 60),
    adults: boundedNumber(raw.adults, fallback.adults, 1, 30),
    children: boundedNumber(raw.children, fallback.children, 0, 20),
    budget: raw.budget === 'Value' || raw.budget === 'Mid-range' || raw.budget === 'Luxury' ? raw.budget : fallback.budget,
    pace: raw.pace === 'Relaxed' || raw.pace === 'Balanced' || raw.pace === 'Active' ? raw.pace : fallback.pace,
    interests: Array.isArray(raw.interests) ? [...new Set(raw.interests.filter((item): item is string => typeof item === 'string' && item.trim().length > 0 && item.length <= 60))].slice(0, 12) : fallback.interests,
    tripStyle: typeof raw.tripStyle === 'string' && raw.tripStyle.length <= 80 ? raw.tripStyle : fallback.tripStyle,
    destinationId: raw.destinationId === null || (typeof raw.destinationId === 'string' && /^[a-z0-9-]{1,64}$/.test(raw.destinationId)) ? raw.destinationId : fallback.destinationId,
  };
}

export function normalizeSavedIds(value: unknown, validIds: string[]): string[] {
  const valid = new Set(validIds);
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && valid.has(id)))] : [];
}
