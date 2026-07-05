const GOOGLE_ANALYTICS_ID = 'G-44V46CDF6Y';
const CONSENT_STORAGE_KEY = 'dp_cookie_consent_v1';

let analyticsReady = false;

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
  if (typeof window === 'undefined' || analyticsReady || !hasAnalyticsConsent()) return false;
  window[`ga-disable-${GOOGLE_ANALYTICS_ID}`] = false;

  const dataLayer = (window.dataLayer = window.dataLayer || []);
  window.gtag = window.gtag || function gtag() {
    dataLayer.push(arguments);
  };

  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
    document.head.appendChild(script);
  }

  window.gtag('js', new Date());
  window.gtag('config', GOOGLE_ANALYTICS_ID, { send_page_view: false });
  analyticsReady = true;
  return true;
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
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return;
  loadGoogleAnalytics();
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
