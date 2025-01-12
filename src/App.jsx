import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.css";
import "./App.css";
import ErrorBoundary from "./components/error/ErrorBoundary";
import ScrollToTop from "./utils/scrollToTop";
import { revealElements } from "./utils/revealElements";
import Layout from "./components/layout/Layout";

// Lazy-loaded components
const Home = lazy(() => import("./components/home/Home"));
const AboutPage = lazy(() => import("./components/aboutus/AboutPage"));
const ToursPage = lazy(() => import("./components/excursions/ToursPage"));
const MyImageGallery = lazy(() => import("./components/gallery/MyImageGallery"));
const Store = lazy(() => import("./components/store/Store"));
const PolicyInfo = lazy(() => import("./components/cookies/PolicyInfo"));
const TourDetails = lazy(() => import("./components/excursions/TourDetails")); 

function App() {
  useEffect(() => {
    window.addEventListener("scroll", revealElements);
    revealElements();
    return () => {
      window.removeEventListener("scroll", revealElements);
    };
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <ErrorBoundary>
        <Layout>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/excursions" element={<ToursPage />} />
              <Route path="/aboutus" element={<AboutPage />} />
              <Route path="/gallery" element={<MyImageGallery />} />
              <Route path="/booking" element={<Store />} />
              <Route path="/cookies-policy" element={<PolicyInfo />} />
              <Route path="/privacy-policy" element={<PolicyInfo />} />
              <Route path="/terms-of-service" element={<PolicyInfo />} />
              <Route
                path="/excursions/:id" 
                element={<TourDetails />}
              />
            </Routes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;