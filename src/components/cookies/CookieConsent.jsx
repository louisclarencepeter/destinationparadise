import { useState, useEffect } from 'react';
import './CookieConsent.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite } from '@fortawesome/free-solid-svg-icons';
import CookieModal from './CookieModal';
import CookieInfo from './CookieInfo';

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
