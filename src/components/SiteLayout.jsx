import { Outlet } from 'react-router-dom';
import SiteNav from './SiteNav.jsx';
import SiteFooter, { WhatsAppFab } from './SiteFooter.jsx';

export default function SiteLayout() {
  return (
    <>
      <SiteNav />
      <Outlet />
      <SiteFooter />
      <WhatsAppFab />
    </>
  );
}
