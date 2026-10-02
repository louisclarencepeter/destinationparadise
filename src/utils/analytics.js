const GOOGLE_TAG_ID = 'GT-WVRZ4PC6';
const GOOGLE_ANALYTICS_ID = 'G-44V46CDF6Y';
const CONSENT_STORAGE_KEY = 'dp_cookie_consent_v1';

let analyticsReady = false;

// Confirmation URLs can contain order access tokens. Guard at the shared
// entry points, before loading a script or sending any initial page view.
export function isPrivateOrderPath(path) {
  return /^\/store\/order(?:\/|\?|#|$)/.test(String(path || ''));
}

function isPrivateOrderPage() {
  return typeof window !== 'undefined' && isPrivateOrderPath(window.location?.pathname);
}

function readAnalyticsConsent() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) || 'null');
    return Boolean(stored?.choices?.analytics);
  } catch {
    return false;
  }
}

export function hasAnalyticsConsent() {
  if (typeof window === 'undefined') return false;
  return readAnalyticsConsent();
}

export function loadGoogleAnalytics() {
  if (typeof window === 'undefined' || isPrivateOrderPage() || analyticsReady || !hasAnalyticsConsent()) return false;
  window[`ga-disable-${GOOGLE_ANALYTICS_ID}`] = false;

  const dataLayer = (window.dataLayer = window.dataLayer || []);
  window.gtag = window.gtag || function gtag() {
    dataLayer.push(arguments);
  };

  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`;
    document.head.appendChild(script);
  }

  window.gtag('js', new Date());
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  window.gtag('config', GOOGLE_TAG_ID, { send_page_view: false });
  analyticsReady = true;
  return true;
}

// Suspend already-loaded analytics before SPA navigation to a private page.
// Keep the guest's stored consent and cookies intact; public pages can resume.
export function suspendGoogleAnalytics() {
  if (typeof window === 'undefined') return;
  window[`ga-disable-${GOOGLE_ANALYTICS_ID}`] = true;
  analyticsReady = false;
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', { analytics_storage: 'denied' });
  }
  document.querySelectorAll(`script[src*="googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}"]`)
    .forEach((script) => script.remove());
}

function deleteCookie(name, domain) {
  const domainPart = domain ? `; domain=${domain}` : '';
  document.cookie = `${name}=; Max-Age=0; path=/${domainPart}; SameSite=Lax`;
}

function deleteAnalyticsCookies() {
  const hostParts = window.location.hostname.split('.');
  const domains = new Set(['']);

  for (let index = 0; index < hostParts.length - 1; index += 1) {
    domains.add(`.${hostParts.slice(index).join('.')}`);
  }

  const cookieNames = document.cookie
    .split(';')
    .map((cookie) => cookie.trim().split('=')[0])
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name === '_gat');

  cookieNames.forEach((name) => {
    domains.forEach((domain) => deleteCookie(name, domain));
  });
}

export function revokeGoogleAnalytics() {
  if (typeof window === 'undefined') return;
  window[`ga-disable-${GOOGLE_ANALYTICS_ID}`] = true;
  analyticsReady = false;
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', { analytics_storage: 'denied' });
  }
  deleteAnalyticsCookies();
}

export function trackPageView(path) {
  if (typeof window === 'undefined' || isPrivateOrderPage() || isPrivateOrderPath(path) || !hasAnalyticsConsent()) return;
  loadGoogleAnalytics();
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'page_view', {
    send_to: GOOGLE_ANALYTICS_ID,
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

// Consent-gated custom events. Callers must only pass anonymous funnel data;
// never names, email addresses, phone numbers, notes, or payment references.
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined' || isPrivateOrderPage() || !hasAnalyticsConsent()) return;
  loadGoogleAnalytics();
  if (typeof window.gtag !== 'function') return;

  // Also reject accidental personal/order fields from any shared caller.
  const { transaction_id: _transactionId, reference: _reference, token: _token, email: _email, phone: _phone, name: _name, ...anonymousParams } = params;
  window.gtag('event', eventName, { send_to: GOOGLE_ANALYTICS_ID, ...anonymousParams });
}
