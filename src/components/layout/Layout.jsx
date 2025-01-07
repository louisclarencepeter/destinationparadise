import PropTypes from 'prop-types';
import useScrollToTop from '../../utils/scrollToTop'; 
import Header from '../header/NavBar';
import Footer from '../footer/Footer';
import CookieConsent from '../cookies/CookieConsent';
import Chatbot from '../chatbot/Chatbot';

const Layout = ({ children }) => {
  useScrollToTop(); 

  return (
    <div className='main-container'>
      <Header />
      {children}
      <Footer />
      <CookieConsent />
      <Chatbot />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;