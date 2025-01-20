// Layout.jsx
import PropTypes from 'prop-types';
import useScrollToTop from '../../utils/scrollToTop'; 
import Header from '../header/NavBar';
import Footer from '../footer/Footer';
import CookieConsent from '../cookies/CookieConsent';
import Chatbot from '../chatbot/Chatbot';

const Layout = ({ children }) => {
  useScrollToTop(); 

  return (
    <>
      <Header />
      <main className='main-content'>
        {children}
      </main>
      <Footer />
      <CookieConsent />
      <Chatbot />
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;