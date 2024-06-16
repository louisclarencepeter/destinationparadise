import './Footer.scss';
import { useState } from 'react';

function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/.netlify/functions/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message);
        setEmail('');
      } else {
        const error = await response.json();
        setMessage(error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <footer className="footer reveal">
      <div className="footer__container">
        <h5 className="footer__title">Subscribe to our newsletter! 🚀💬💌</h5>
        <form onSubmit={handleSubmit} className="footer__form">
          <input
            type="email"
            className="footer__input"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="footer__button">&gt;</button>
        </form>
        {message && <p className="footer__message">{message}</p>}
        <div className="footer__info">
          <p>Destination Paradise</p>
          <p>
            Phone: +255 748 352 657
            <a href="https://wa.me/255748352657" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" className="footer__whatsapp-link">
              <i className="fab fa-whatsapp footer__whatsapp-icon"></i>
            </a>
          </p>
          <p>Zanzibar, Tanzania</p>
        </div>
        <div className="footer__contact">
          <p>info@yournexttriptoparadise.com</p>
          <div className="footer__social">
            <a href="https://www.facebook.com/yournexttriptoparadise/" target="_blank" rel="noopener noreferrer" aria-label="Visit our Facebook page">
              <i className="fab fa-facebook" aria-hidden="true"></i>
            </a>
            <a href="https://www.instagram.com/yournexttriptoparadise/" target="_blank" rel="noopener noreferrer" aria-label="Visit our Instagram page">
              <i className="fab fa-instagram" aria-hidden="true"></i>
            </a>
            <a href="https://www.youtube.com/@destinationparadisezanzibar" target="_blank" rel="noopener noreferrer" aria-label="Visit our YouTube channel">
              <i className="fab fa-youtube" aria-hidden="true"></i>
            </a>
            <a href="https://twitter.com/destinationpar5" target="_blank" rel="noopener noreferrer" aria-label="Visit our Twitter page">
              <i className="fab fa-twitter" aria-hidden="true"></i>
            </a>
          </div>
        </div>
        <div className="footer__legal">
          <a href="/privacy-policy">Privacy Policy</a>
          |
          <a href="/terms-of-service">Terms of Service</a>
        </div>
        <div className="footer__copyright">
          <p>&copy; 2023 Destination Paradise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
