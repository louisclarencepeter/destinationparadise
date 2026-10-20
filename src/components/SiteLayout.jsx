import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router';
import { useTranslation } from 'react-i18next';
import SiteNav from './SiteNav.jsx';
import SiteFooter, { WhatsAppFab } from './SiteFooter.jsx';
import PageScrollCue from './PageScrollCue.jsx';
import FloatingBackButton from './FloatingBackButton.jsx';
import CookieBanner from './CookieBanner.jsx';
import { isStoreEnabled } from '../config/featureFlags.js';

// Lazy so the store bundle (catalog data, drawer UI) never loads while the
// store feature flag is off.
const CartDrawer = lazy(() => import('./store/CartDrawer.jsx'));
import { loadGoogleAnalytics, revokeGoogleAnalytics, trackPageView } from '../utils/analytics.js';
import { preferredScrollBehavior } from '../utils/motion.js';
import {
  announceTheme,
  applyTheme,
  normalizeThemeMode,
  persistThemeMode,
  readStoredThemeMode,
  resolveThemeForMode,
  watchAutomaticTheme,
} from '../utils/theme.js';

export default function SiteLayout() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { t } = useTranslation('common');
  const [themeState, setThemeState] = useState(() => {
    const mode = readStoredThemeMode();
    return { mode, theme: resolveThemeForMode(mode) };
  });
  const { mode, theme } = themeState;

  useEffect(() => {
    const nextTheme = applyTheme(theme);
    persistThemeMode(mode, nextTheme);
    announceTheme(nextTheme, mode);
  }, [mode, theme]);

  useEffect(() => {
    if (mode !== 'auto') return undefined;

    return watchAutomaticTheme((nextTheme) => {
      setThemeState((current) => {
        if (current.mode !== 'auto' || current.theme === nextTheme) return current;
        return { ...current, theme: nextTheme };
      });
    });
  }, [mode]);

  const setThemeMode = (nextMode) => {
    const normalizedMode = normalizeThemeMode(nextMode);
    const nextTheme = resolveThemeForMode(normalizedMode, theme);
    setThemeState((current) => (
      current.mode === normalizedMode && current.theme === nextTheme
        ? current
        : { mode: normalizedMode, theme: nextTheme }
    ));
  };

  useEffect(() => {
    loadGoogleAnalytics();
  }, []);

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;
    trackPageView(path);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const handleConsentChange = (event) => {
      if (!event.detail?.choices?.analytics) {
        revokeGoogleAnalytics();
        return;
      }
      const path = `${location.pathname}${location.search}${location.hash}`;
      trackPageView(path);
    };

    window.addEventListener('dp-cookie-consent', handleConsentChange);
    return () => window.removeEventListener('dp-cookie-consent', handleConsentChange);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (!hash) {
      if (navigationType !== 'POP') {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
      return;
    }

    let timeoutId = 0;
    let attempts = 0;
    let stablePositions = 0;
    let lastDocumentHeight = -1;
    let lastTargetPosition = -1;
    const interruptEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'];

    const findTarget = () => {
      const deferredAnchor = Array.from(document.querySelectorAll('[data-deferred-anchor]'))
        .find((element) => element.getAttribute('data-deferred-anchor') === hash);
      return document.getElementById(hash) || deferredAnchor;
    };

    const settlePosition = () => {
      const target = findTarget();
      if (!target) return;
      const doc = document.documentElement;
      const padding = Number.parseFloat(window.getComputedStyle(doc).scrollPaddingTop) || 0;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY;
      const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
      const desiredScroll = Math.min(maxScroll, Math.max(0, targetPosition - padding));
      const aligned = Math.abs(window.scrollY - desiredScroll) <= 3;

      if (!aligned) window.scrollTo({ top: desiredScroll, behavior: 'instant' });
      stablePositions = aligned
        && Boolean(document.getElementById(hash))
        && doc.scrollHeight === lastDocumentHeight
        && Math.abs(targetPosition - lastTargetPosition) <= 3
        ? stablePositions + 1
        : 0;
      lastDocumentHeight = doc.scrollHeight;
      lastTargetPosition = targetPosition;
      attempts += 1;
      if (attempts < 32 && (attempts < 8 || stablePositions < 4)) {
        timeoutId = window.setTimeout(settlePosition, 120);
      }
    };

    const startScroll = () => {
      const target = findTarget();
      if (!target) return false;
      target.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
      timeoutId = window.setTimeout(
        settlePosition,
        preferredScrollBehavior() === 'smooth' ? 700 : 80,
      );
      return true;
    };

    // A lazy route may still be loading when this effect runs. Watch for its
    // section, then keep the destination aligned while deferred content loads.
    // Any deliberate user interaction takes control away from this settling.
    const observer = new MutationObserver(() => {
      if (startScroll()) observer.disconnect();
    });
    observer.observe(document.getElementById('main-content') || document.body, {
      childList: true,
      subtree: true,
    });
    if (startScroll()) observer.disconnect();
    const cancelScroll = () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
    };
    interruptEvents.forEach((event) => window.addEventListener(event, cancelScroll, { passive: true }));
    return () => {
      cancelScroll();
      interruptEvents.forEach((event) => window.removeEventListener(event, cancelScroll));
    };
  }, [location.pathname, location.hash, location.key, navigationType]);

  return (
    <>
      <a className="skip-link" href="#main-content">{t('a11y.skip_to_content')}</a>
      <SiteNav theme={theme} themeMode={mode} onThemeModeChange={setThemeMode} />
      <div className="site-main" id="main-content" tabIndex={-1}>
        <Outlet />
      </div>
      <SiteFooter />
      <PageScrollCue />
      <WhatsAppFab locationKey={`${location.pathname}${location.hash}`} />
      <FloatingBackButton />
      <CookieBanner />
      {isStoreEnabled() && (
        <Suspense fallback={null}>
          <CartDrawer />
        </Suspense>
      )}
    </>
  );
}
