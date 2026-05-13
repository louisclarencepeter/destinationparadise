import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import SiteLayout from './components/SiteLayout.jsx';

function lazyWithRetry(factory) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      const message = error?.message || '';
      const isChunkError =
        error?.name === 'ChunkLoadError' ||
        /Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
          message,
        );
      if (!isChunkError) throw error;
      await new Promise((r) => setTimeout(r, 250));
      return factory();
    }
  });
}

const Homepage = lazyWithRetry(() => import('./pages/Homepage.jsx'));
const Excursions = lazyWithRetry(() => import('./pages/Excursions.jsx'));
const ExcursionCombinationDetail = lazyWithRetry(() => import('./pages/ExcursionCombinationDetail.jsx'));
const ExcursionDetail = lazyWithRetry(() => import('./pages/ExcursionDetail.jsx'));
const Safaris = lazyWithRetry(() => import('./pages/Safaris.jsx'));
const SafariDetail = lazyWithRetry(() => import('./pages/SafariDetail.jsx'));
const SafariTypeDetail = lazyWithRetry(() => import('./pages/SafariTypeDetail.jsx'));
const Packages = lazyWithRetry(() => import('./pages/Packages.jsx'));
const PackageDetail = lazyWithRetry(() => import('./pages/PackageDetail.jsx'));
const TripPlannerPage = lazyWithRetry(() => import('./pages/TripPlannerPage.jsx'));
const Explore = lazyWithRetry(() => import('./pages/Explore.jsx'));
const About = lazyWithRetry(() => import('./pages/About.jsx'));
const Booking = lazyWithRetry(() => import('./pages/Booking.jsx'));
const Policy = lazyWithRetry(() => import('./pages/Policy.jsx'));
const Transfers = lazyWithRetry(() => import('./pages/Transfers.jsx'));
const NotFound = lazyWithRetry(() => import('./pages/NotFound.jsx'));

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/excursions" element={<Excursions />} />
          <Route path="/excursions/combinations/:id" element={<ExcursionCombinationDetail />} />
          <Route path="/excursions/:id" element={<ExcursionDetail />} />
          <Route path="/safaris" element={<Safaris />} />
          <Route path="/safaris/types/:typeId" element={<SafariTypeDetail />} />
          <Route path="/safaris/:id" element={<SafariDetail />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/packages/:id" element={<PackageDetail />} />
          <Route path="/trip-planner" element={<TripPlannerPage />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/book-now" element={<Booking />} />
          <Route path="/aboutus" element={<About />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/cookies-policy" element={<Policy section="cookies" />} />
          <Route path="/privacy-policy" element={<Policy section="privacy" />} />
          <Route path="/terms-of-service" element={<Policy section="terms" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
