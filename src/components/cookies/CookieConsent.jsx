import { useState, useEffect, useCallback } from 'react';
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
        setIsVisible(consent === null);
        setIsIconVisible(consent !== null);
    }, []);

    const handleAccept = useCallback(() => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
        setIsIconVisible(true);
    }, []);

    const handleDecline = useCallback(() => {
        localStorage.setItem('cookieConsent', 'false');
        setIsVisible(false);
        setIsIconVisible(true);
    }, []);

    const handleIconClick = useCallback(() => setIsModalOpen(true), []);
    const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

    return (
        <>
            {isVisible && (
                <div className="cookie-consent-banner">
                    <div className="cookie-consent-content">
                        <div className="cookie-info">
                            <p>
                                By continuing to use our website, you acknowledge that you have read and understood our{" "}
                                <Link to="/cookies-policy" rel="noopener noreferrer">Cookies Policy</Link>,{" "}
                                <Link to="/privacy-policy" rel="noopener noreferrer">Privacy Policy</Link>, and{" "}
                                <Link to="/terms-of-service" rel="noopener noreferrer">Terms of Service</Link>, and you consent to the practices described therein.
                            </p>
                        </div>
                        <div className="cookie-consent-buttons">
                            <button onClick={handleAccept} aria-label="Accept Cookies">Accept</button>
                            <button onClick={handleDecline} aria-label="Decline Cookies">Decline</button>
                        </div>
                    </div>
                </div>
            )}
            {isIconVisible && (
                <button className="cookie-icon" onClick={handleIconClick} aria-label="Cookie Settings">
                    <FontAwesomeIcon icon={faCookieBite} />
                </button>
            )}
            <CookieModal isOpen={isModalOpen} onClose={handleCloseModal} />
        </>
    );
};

export default CookieConsent;