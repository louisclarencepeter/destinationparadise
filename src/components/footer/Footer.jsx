// Footer.jsx
import { useRef } from "react";
import "./Footer.scss";

import NewsletterForm from "./components/NewsletterForm";
import ContactInfo from "./components/ContactInfo";
import SocialLinks from "./components/SocialLinks";
import LegalSection from "./components/LegalSection";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver"; // ✅ fixed import

function Footer() {
  const footerRef = useRef(null);
  const isVisible = useIntersectionObserver(footerRef, { threshold: 0.1 });

  return (
    <footer
      ref={footerRef}
      className={`footer ${isVisible ? "is-visible" : ""}`}
    >
      <div className="footer__container">
        {/* Newsletter Section */}
        <div className="footer__grid-area footer__grid-area--newsletter">
          <h3 className="footer__title">
            Subscribe to our newsletter! 🚀💬💌
          </h3>
          <NewsletterForm />
        </div>

        {/* Contact Section */}
        <div className="footer__grid-area footer__grid-area--contact">
          <h4 className="footer__section-title">Contact Us</h4>
          <ContactInfo />
        </div>

        {/* Social Links */}
        <div className="footer__grid-area footer__grid-area--social">
          <h4 className="footer__section-title">Follow Us</h4>
          <SocialLinks />
        </div>

        {/* Legal Section */}
        <div className="footer__grid-area footer__grid-area--legal">
          <LegalSection />
        </div>

        {/* Copyright */}
        <div className="footer__grid-area footer__grid-area--copyright">
          <p>
            &copy; {new Date().getFullYear()} Destination Paradise. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
