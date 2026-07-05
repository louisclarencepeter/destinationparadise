export function preferredScrollBehavior() {
  if (typeof window === 'undefined') return 'smooth';
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}
