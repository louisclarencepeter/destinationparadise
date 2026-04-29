import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage.jsx';
import Excursions from './pages/Excursions.jsx';
import Safaris from './pages/Safaris.jsx';
import About from './pages/About.jsx';
import Gallery from './pages/Gallery.jsx';
import Booking from './pages/Booking.jsx';
import DreamDhow from './pages/DreamDhow.jsx';
import Policy from './pages/Policy.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/excursions" element={<Excursions />} />
      <Route path="/excursions/:id" element={<Excursions />} />
      <Route path="/safaris" element={<Safaris />} />
      <Route path="/book-now" element={<Safaris />} />
      <Route path="/aboutus" element={<About />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/dream-dhow" element={<DreamDhow />} />
      <Route path="/cookies-policy" element={<Policy section="cookies" />} />
      <Route path="/privacy-policy" element={<Policy section="privacy" />} />
      <Route path="/terms-of-service" element={<Policy section="terms" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
