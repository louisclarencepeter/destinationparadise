import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './CookieConsent.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite } from '@fortawesome/free-solid-svg-icons';
import CookieModal from './CookieModal';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIconVisible, setIsIconVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) {
      setIsVisible(true);
    } else {
      setIsIconVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
    setIsIconVisible(true);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false');
    setIsVisible(false);
    setIsIconVisible(true);
  };

  const handleIconClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const CookieInfo = () => (
    <div className="cookie-info">
      <p>
        By continuing to use our website, you acknowledge that you have read and
        understood our{" "}
        <Link to="/cookies-policy" rel="noopener noreferrer">
          Cookies Policy
        </Link>
        ,{" "}
        <Link to="/privacy-policy" rel="noopener noreferrer">
          Privacy Policy
        </Link>
        , and{" "}
        <Link to="/terms-of-service" rel="noopener noreferrer">
          Terms of Service
        </Link>
        , and you consent to the practices described therein.
      </p>
    </div>
  );

  return (
    <>
      {isVisible && (
        <div className="cookie-consent-banner">
          <div className="cookie-consent-content">
            <CookieInfo />
            <div className="cookie-consent-buttons">
              <button onClick={handleAccept}>Accept</button>
              <button onClick={handleDecline}>Decline</button>
            </div>
          </div>
        </div>
      )}
      {isIconVisible && (
        <button className="cookie-icon" onClick={handleIconClick}>
          <FontAwesomeIcon icon={faCookieBite} />
        </button>
      )}
      <CookieModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default CookieConsent;
