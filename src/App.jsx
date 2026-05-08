import { Routes, Route } from 'react-router-dom';
import SiteLayout from './components/SiteLayout.jsx';
import Homepage from './pages/Homepage.jsx';
import Excursions from './pages/Excursions.jsx';
import ExcursionDetail from './pages/ExcursionDetail.jsx';
import Safaris from './pages/Safaris.jsx';
import SafariDetail from './pages/SafariDetail.jsx';
import SafariTypeDetail from './pages/SafariTypeDetail.jsx';
import Packages from './pages/Packages.jsx';
import TripPlannerPage from './pages/TripPlannerPage.jsx';
import Explore from './pages/Explore.jsx';
import About from './pages/About.jsx';
import Booking from './pages/Booking.jsx';
import Policy from './pages/Policy.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/excursions" element={<Excursions />} />
  <Route path="/excursions/:id" element={<ExcursionDetail />} />
        <Route path="/safaris" element={<Safaris />} />
        <Route path="/safaris/types/:typeId" element={<SafariTypeDetail />} />
        <Route path="/safaris/:id" element={<SafariDetail />} />
        <Route path="/packages" element={<Packages />} />
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
  );
}
