// Footer.jsx
import "./Footer.scss";
import NewsletterForm from "./components/NewsletterForm";
import ContactInfo from "./components/ContactInfo";
import SocialLinks from "./components/SocialLinks";
import LegalSection from "./components/LegalSection";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <h3 className="footer__title">Subscribe to our newsletter! 🚀💬💌</h3>
        <NewsletterForm />
        <ContactInfo />
        <SocialLinks />
        <LegalSection />
        <div className="footer__copyright">
          <p>&copy; {new Date().getFullYear()} Destination Paradise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;