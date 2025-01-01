import { useState, useEffect, useCallback } from 'react';
import { Link } from "react-router-dom";
import './CookieConsent.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite } from '@fortawesome/free-solid-svg-icons';
import CookieModal from './CookieModal';

const CookieConsent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cookieConsentKey = 'cookieConsent';

    // Check for existing consent only once on component mount
    useEffect(() => {
        const consent = localStorage.getItem(cookieConsentKey);
        if (consent === null) {
            // Delay showing the banner slightly
            const timer = setTimeout(() => {
                const bannerElement = document.querySelector('.cookie-consent-banner');
                if (bannerElement) {
                    bannerElement.style.display = 'flex'; // Assuming your CSS uses flex for layout
                }
            }, 500); // Adjust delay as needed (500ms is a good starting point)

            return () => clearTimeout(timer);
        } else {
            // Show icon immediately if consent is already given
            const iconElement = document.querySelector('.cookie-icon');
            if (iconElement) {
                iconElement.style.display = 'block'; // Or whichever display value you use in CSS
            }
        }
    }, []);

    const handleAccept = useCallback(() => {
        localStorage.setItem(cookieConsentKey, 'true');
        hideBannerAndShowIcon();
    }, []);

    const handleDecline = useCallback(() => {
        localStorage.setItem(cookieConsentKey, 'false');
        hideBannerAndShowIcon();
    }, []);

    const hideBannerAndShowIcon = () => {
        const bannerElement = document.querySelector('.cookie-consent-banner');
        if (bannerElement) {
            bannerElement.style.display = 'none';
        }

        const iconElement = document.querySelector('.cookie-icon');
        if (iconElement) {
            iconElement.style.display = 'block'; // Or whichever display value you use in CSS
        }
    };

    const handleIconClick = useCallback(() => setIsModalOpen(true), []);
    const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

    return (
        <>
            <div className="cookie-consent-banner" style={{ display: 'none' }}>
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
            <button className="cookie-icon" onClick={handleIconClick} aria-label="Cookie Settings" style={{ display: 'none' }}>
                <FontAwesomeIcon icon={faCookieBite} />
            </button>
            <CookieModal isOpen={isModalOpen} onClose={handleCloseModal} />
        </>
    );
};

export default CookieConsent;