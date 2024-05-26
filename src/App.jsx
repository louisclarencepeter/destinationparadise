import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.css';
import './App.css';
import Header from './components/header/NavBar.jsx';
import Home from './components/Home.jsx';
import AboutPage from './components/aboutus/AboutPage.jsx';
import ToursPage from './components/excursions/ToursPage.jsx';
import MyImageGallery from './components/gallery/MyImageGallery.jsx';
import Footer from './components/footer/Footer.jsx';
import Store from './components/store/Store.jsx';
import ErrorBoundary from './components/error/ErrorBoundary.jsx';
import ScrollToTop from './utils/ScrollToTop.jsx';
import CookieConsent from './components/CookieConsent'; // Import the CookieConsent component

function App() {
  useEffect(() => {
    function reveal() {
      const reveals = document.querySelectorAll(".reveal");
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
          reveals[i].classList.add("active");
        } else {
          reveals[i].classList.remove("active");
        }
      }
    }

    window.addEventListener("scroll", reveal);

    reveal();

    return () => {
      window.removeEventListener("scroll", reveal);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <ErrorBoundary>
        <div className='main-container'>
          <Header />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/excursions" element={<ToursPage />} />
            <Route path="/aboutus" element={<AboutPage />} />
            <Route path="/gallery" element={<MyImageGallery />} />  
            <Route path="/booking" element={<Store />} />
          </Routes>
          <Footer />
          <CookieConsent /> {/* Add the CookieConsent component here */}
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
