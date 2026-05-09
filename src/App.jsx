import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import SiteLayout from './components/SiteLayout.jsx';

const Homepage = lazy(() => import('./pages/Homepage.jsx'));
const Excursions = lazy(() => import('./pages/Excursions.jsx'));
const ExcursionCombinationDetail = lazy(() => import('./pages/ExcursionCombinationDetail.jsx'));
const ExcursionDetail = lazy(() => import('./pages/ExcursionDetail.jsx'));
const Safaris = lazy(() => import('./pages/Safaris.jsx'));
const SafariDetail = lazy(() => import('./pages/SafariDetail.jsx'));
const SafariTypeDetail = lazy(() => import('./pages/SafariTypeDetail.jsx'));
const Packages = lazy(() => import('./pages/Packages.jsx'));
const PackageDetail = lazy(() => import('./pages/PackageDetail.jsx'));
const TripPlannerPage = lazy(() => import('./pages/TripPlannerPage.jsx'));
const Explore = lazy(() => import('./pages/Explore.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Booking = lazy(() => import('./pages/Booking.jsx'));
const Policy = lazy(() => import('./pages/Policy.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

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
          <Route path="/cookies-policy" element={<Policy section="cookies" />} />
          <Route path="/privacy-policy" element={<Policy section="privacy" />} />
          <Route path="/terms-of-service" element={<Policy section="terms" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
