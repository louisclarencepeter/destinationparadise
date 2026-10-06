// Feature flags.
//
// The multi-trip experiences store (HANDOFF.md, Phase 1) ships dark: its
// routes, nav entries, cart provider UI and the excursion-page booking panel
// all mount only when the flag is on. Production stays unchanged until the
// pilot inventory, policies and DPO onboarding are approved.
//
// Two ways to turn it on:
//   - build-time: VITE_STORE_ENABLED=true (e.g. in a Netlify deploy context)
//   - per-browser preview: localStorage.setItem('dp_store_preview', '1')
const STORE_PREVIEW_KEY = 'dp_store_preview';

export function isStoreEnabled() {
  if (import.meta.env.VITE_STORE_ENABLED === 'true') return true;
  try {
    return window.localStorage.getItem(STORE_PREVIEW_KEY) === '1';
  } catch {
    return false;
  }
}

export default isStoreEnabled;
