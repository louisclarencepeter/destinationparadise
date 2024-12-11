import "./Footer.scss";
import { useState } from "react";

function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("/.netlify/functions/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Thank you for subscribing to our newsletter!");
        setEmail("");
      } else {
        const error = await response.json();
        setMessage(error.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <footer className="footer reveal">
      <div className="footer__container reveal">
        <h5 className="footer__title reveal">
          Subscribe to our newsletter! 🚀💬💌
        </h5>
        <form onSubmit={handleSubmit} className="footer__form reveal" aria-label="Newsletter subscription form">
          <label htmlFor="email" className="visually-hidden">Email address</label>
          <input
            id="email"
            type="email"
            className="footer__input reveal"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email address"
          />
          <button type="submit" className="footer__button reveal" aria-label="Submit email for newsletter">
            &gt;
          </button>
        </form>
        {message && <p className="footer__message reveal">{message}</p>}
        <div className="footer__info reveal">
          <p>Destination Paradise</p>
          <p>
            Phone: <a href="tel:+255748352657" aria-label="Call us at +255 748 352 657">+255 748 352 657</a>
            <a
              href="https://wa.me/255748352657"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="footer__whatsapp-link reveal"
              style={{ padding: '12px', margin: '0 8px' }}
            >
              <i className="fab fa-whatsapp footer__whatsapp-icon reveal" aria-hidden="true"></i>
            </a>
          </p>
          <p className="reveal">
            <a href="mailto:info@yournexttriptoparadise.com" aria-label="Send us an email">
              info@yournexttriptoparadise.com
            </a>
          </p>
          <p>Zanzibar, Tanzania</p>
        </div>

        <div className="footer__contact">
          <div className="footer__social">
            <a
              href="https://www.facebook.com/yournexttriptoparadise/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Facebook page"
              className="footer__social-link"
              style={{ display: 'inline-block', width: '48px', height: '48px', padding: '12px', textAlign: 'center' }}
            >
              <i className="fab fa-facebook" aria-hidden="true"></i>
            </a>
            <a
              href="https://www.instagram.com/yournexttriptoparadise/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Instagram page"
              className="footer__social-link"
              style={{ display: 'inline-block', width: '48px', height: '48px', padding: '12px', textAlign: 'center' }}
            >
              <i className="fab fa-instagram" aria-hidden="true"></i>
            </a>
            <a
              href="https://www.youtube.com/@destinationparadisezanzibar"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our YouTube channel"
              className="footer__social-link"
              style={{ display: 'inline-block', width: '48px', height: '48px', padding: '12px', textAlign: 'center' }}
            >
              <i className="fab fa-youtube" aria-hidden="true"></i>
            </a>
            <a
              href="https://twitter.com/destinationpar5"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Twitter page"
              className="footer__social-link"
              style={{ display: 'inline-block', width: '48px', height: '48px', padding: '12px', textAlign: 'center' }}
            >
              <i className="fab fa-twitter" aria-hidden="true"></i>
            </a>
          </div>
        </div>
        <div className="footer__legal">
          <a href="/privacy-policy" aria-label="Read our Privacy Policy" style={{ padding: '8px' }}>Privacy Policy</a>|
          <a href="/terms-of-service" aria-label="Read our Terms of Service" style={{ padding: '8px' }}>Terms of Service</a>
        </div>
        <div className="footer__copyright">
          <p>&copy; 2023 Destination Paradise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
