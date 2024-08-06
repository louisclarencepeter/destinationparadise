import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Header from '../header/NavBar';
import Footer from '../footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleChatIconClick = () => {
    navigate('/chat');
  };

  return (
    <div className="layout">
      <Header />
      <main>{children}</main>
      <Footer />
      <button 
        className="chatbot-toggle" 
        onClick={handleChatIconClick}
        aria-label="Open chat"
      >
        <FontAwesomeIcon icon={faCommentDots} />
      </button>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
