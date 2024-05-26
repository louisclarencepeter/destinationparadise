import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite } from '@fortawesome/free-solid-svg-icons';
import './CookieConsent.scss';
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

  const handleIconClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {isVisible && (
        <div className="cookie-consent-banner">
          <div className="cookie-consent-content">
            <p>
              We use cookies to improve your experience on our site and to show you
              personalized content. By using our site, you accept our use of cookies.
              <a href="/cookies-policy" target="_blank" rel="noopener noreferrer">
                Learn more
              </a>
            </p>
            <div className="cookie-consent-buttons">
              <button onClick={handleAccept}>Accept</button>
              <button onClick={handleDecline}>Decline</button>
            </div>
          </div>
        </div>
      )}
      {isIconVisible && (
        <div className="cookie-icon" onClick={handleIconClick}>
          <FontAwesomeIcon icon={faCookieBite} />
        </div>
      )}
      <CookieModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default CookieConsent;
