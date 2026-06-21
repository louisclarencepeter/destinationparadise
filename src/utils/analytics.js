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
