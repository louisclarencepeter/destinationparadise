import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
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

    const scrollToHash = () => {
      const target = document.getElementById(hash);
      if (target) {
        target.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
      }
    };

    const timeoutId = window.setTimeout(scrollToHash, 0);
    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, location.hash, navigationType]);

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
