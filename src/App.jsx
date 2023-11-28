import '@fortawesome/fontawesome-free/css/all.css';
import './App.css'
import Header from './components/header/NavBar.jsx'
import Hero from './components/main/Hero.jsx';
import Excursions from './components/main/Excursions.jsx';
import Gallery from './components/main/Gallery.jsx';
import Testimonials from './components/main/Testimonials.jsx';
import MyMap from './components/main/MyMap.jsx';

function App() {

  return (
    < >
      <div className='main-container'>
        <Header />
        <Hero />
        <Excursions />
        <Gallery />
        <Testimonials />
        <MyMap />
      </div>
    </>
  )
}

export default App
