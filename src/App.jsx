import { useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.css';
import './App.css';
import Header from './components/header/NavBar.jsx';
import Hero from './components/main/Hero.jsx';
import Excursions from './components/main/Excursions.jsx';
import Gallery from './components/main/Gallery.jsx';
import Testimonials from './components/main/Testimonials.jsx';
import MyMap from './components/main/MyMap.jsx';
import Footer from './components/footer/Footer.jsx';

function App() {
  useEffect(() => {
    // Define the reveal function
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

    // Attach the event listener
    window.addEventListener("scroll", reveal);

    // Check the scroll position on page load
    reveal();

    // Clean up function
    return () => {
      window.removeEventListener("scroll", reveal);
    };
  }, []);

  return (
    <div className='main-container'>
      <Header />
      <Hero />
      <Excursions />
      <Gallery />
      <Testimonials />
      <MyMap />
      <Footer />
    </div>
  );
}

export default App;

