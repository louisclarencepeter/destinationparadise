import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.css';
import './App.css';
import ErrorBoundary from './components/error/ErrorBoundary';
import ScrollToTop from './utils/scrollToTop';
import { revealElements } from './utils/revealElements';
import Layout from './components/layout/Layout';

const Home = lazy(() => import('./components/home/Home'));
const AboutPage = lazy(() => import('./components/aboutus/AboutPage'));
const ToursPage = lazy(() => import('./components/excursions/ToursPage'));
const MyImageGallery = lazy(() => import('./components/gallery/MyImageGallery'));
const Store = lazy(() => import('./components/store/Store'));

function App() {
  useEffect(() => {
    window.addEventListener("scroll", revealElements);
    revealElements();
    return () => {
      window.removeEventListener("scroll", revealElements);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <ErrorBoundary>
        <Layout>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route path="/excursions" element={<ToursPage />} />
              <Route path="/aboutus" element={<AboutPage />} />
              <Route path="/gallery" element={<MyImageGallery />} />  
              <Route path="/booking" element={<Store />} />
            </Routes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
