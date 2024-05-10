// App.jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.css';
import './App.css';
import Header from './components/header/NavBar.jsx';
import Home from './components/Home.jsx';
import ToursPage from './components/excursions/ToursPage.jsx';
import Footer from './components/footer/Footer.jsx';

function App() {
  return (
    <Router>
      <div className='main-container'>
        <Header />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/excursions" element={<ToursPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;