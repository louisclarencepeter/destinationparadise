import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteNav from './SiteNav.jsx';
import SiteFooter, { WhatsAppFab } from './SiteFooter.jsx';
import PageScrollCue from './PageScrollCue.jsx';

export default function SiteLayout() {
  const location = useLocation();

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
      <SiteNav />
      <Outlet />
      <SiteFooter />
      <PageScrollCue />
      <WhatsAppFab />
    </>
  );
}
