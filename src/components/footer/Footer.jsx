// Footer.jsx
import { memo, useMemo } from 'react';
import "./Footer.scss";
import NewsletterForm from "./components/NewsletterForm";
import ContactInfo from "./components/ContactInfo";
import SocialLinks from "./components/SocialLinks";
import LegalSection from "./components/LegalSection";

const Footer = memo(function Footer() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  
  return (
    <footer className="footer" role="contentinfo" aria-label="Site footer">
      <div className="footer__container">
        <div className="footer__content">
          <div className="footer__newsletter">
            <h3 className="footer__title" id="newsletter-heading">
              Subscribe to our newsletter! 🚀💬💌
            </h3>
            <NewsletterForm ariaLabelledBy="newsletter-heading" />
          </div>
          
          <div className="footer__sections">
            <ContactInfo />
            <SocialLinks />
            <LegalSection />
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
