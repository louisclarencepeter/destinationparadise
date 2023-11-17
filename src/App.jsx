import '@fortawesome/fontawesome-free/css/all.css';
import './App.css'
import Header from './components/header/NavBar.jsx'
import Hero from './components/main/Hero.jsx'
import Excursions from './components/main/Excursions.jsx';

function App() {

  return (
    < >
      <div className='main-container'>
        <Header />
        <Hero />
        <Excursions />
      </div>
    </>
  )
}

export default App
