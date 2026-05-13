import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import SiteNav from './SiteNav.jsx';
import SiteFooter, { WhatsAppFab } from './SiteFooter.jsx';
import PageScrollCue from './PageScrollCue.jsx';
import FloatingBackButton from './FloatingBackButton.jsx';
import CookieBanner from './CookieBanner.jsx';
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
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const timeoutId = window.setTimeout(scrollToHash, 0);
    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, location.hash, navigationType]);

  return (
    <>
      <SiteNav />
      <div className="site-main">
        <Outlet />
      </div>
      <SiteFooter theme={theme} themeMode={mode} onThemeModeChange={setThemeMode} />
      <PageScrollCue />
      <WhatsAppFab locationKey={`${location.pathname}${location.hash}`} />
      <FloatingBackButton />
      <CookieBanner />
    </>
  );
}
