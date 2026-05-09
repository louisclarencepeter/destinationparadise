import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteNav from './SiteNav.jsx';
import SiteFooter, { WhatsAppFab } from './SiteFooter.jsx';
import PageScrollCue from './PageScrollCue.jsx';
import { announceTheme, applyTheme, persistTheme, readStoredTheme } from '../utils/theme.js';

export default function SiteLayout() {
  const location = useLocation();
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    const nextTheme = applyTheme(theme);
    persistTheme(nextTheme);
    announceTheme(nextTheme);
  }, [theme]);

  useEffect(() => {
    const onThemeChange = (event) => {
      const nextTheme = event.detail?.theme;
      if (nextTheme) setTheme((current) => (current === nextTheme ? current : nextTheme));
    };
    window.addEventListener('dp-theme-change', onThemeChange);
    return () => window.removeEventListener('dp-theme-change', onThemeChange);
  }, []);

  const toggleTheme = (nextTheme) => {
    setTheme((current) => nextTheme || (current === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
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
  }, [location.pathname, location.hash]);

  return (
    <>
      <SiteNav theme={theme} onThemeToggle={toggleTheme} />
      <Outlet />
      <SiteFooter />
      <PageScrollCue />
      <WhatsAppFab />
    </>
  );
}
