// Footer.jsx
import { memo, useMemo, useState } from 'react';
import "./Footer.scss";
import NewsletterForm from "./components/NewsletterForm";
import ContactInfo from "./components/ContactInfo";
import SocialLinks from "./components/SocialLinks";
import LegalSection from "./components/LegalSection";
import ErrorBoundary from "./components/ErrorBoundary";

const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear(); // Removed unnecessary useMemo
  const [newsletterStatus, setNewsletterStatus] = useState('');
  
  const handleNewsletterStatusChange = (status) => {
    setNewsletterStatus(status);
  };
  
  return (
    <footer className="footer" role="contentinfo" aria-label="Site footer">
      <div className="footer__container">
        <div className="footer__content">
          <section className="footer__newsletter" aria-labelledby="newsletter-heading">
            <h3 className="footer__title" id="newsletter-heading">
              Subscribe to our newsletter! 🚀💬💌
            </h3>
            <ErrorBoundary fallback={<p>Newsletter signup temporarily unavailable</p>}>
              <NewsletterForm 
                ariaLabelledBy="newsletter-heading"
                onStatusChange={handleNewsletterStatusChange}
              />
            </ErrorBoundary>
            {/* Live region for newsletter status updates */}
            <div 
              className="sr-only" 
              aria-live="polite" 
              aria-atomic="true"
            >
              {newsletterStatus}
            </div>
          </section>
          
          <div className="footer__sections">
            <ErrorBoundary fallback={<p>Contact information unavailable</p>}>
              <ContactInfo />
            </ErrorBoundary>
            
            <section aria-labelledby="social-heading">
              <h4 className="sr-only" id="social-heading">Follow us on social media</h4>
              <ErrorBoundary fallback={<p>Social links unavailable</p>}>
                <SocialLinks ariaLabelledBy="social-heading" />
              </ErrorBoundary>
            </section>
            
            <ErrorBoundary fallback={<p>Legal links unavailable</p>}>
              <LegalSection />
            </ErrorBoundary>
          </div>
        </div>
        
        <div className="footer__divider" role="separator" aria-hidden="true"></div>
        
        <div className="footer__bottom">
          <div className="footer__copyright">
            <p>&copy; {currentYear} Destination Paradise. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
