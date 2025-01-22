import "./Footer.scss";
import { useState } from "react";

function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

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
        setMessage(error.message || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        <h3 className="footer__title">Subscribe to our newsletter! 🚀💬💌</h3>
        <form
  onSubmit={handleSubmit}
  className="footer__form"
  aria-label="Newsletter subscription form"
  autoComplete="on"
>
  <label htmlFor="email" className="footer__label">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    className="footer__input"
    placeholder="Enter your email address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    autoComplete="email"
    aria-label="Email address"
  />
  <button
    type="submit"
    className="footer__button"
    aria-label="Submit email for newsletter"
    disabled={isLoading}
  >
    {isLoading ? "Loading..." : ">"}
  </button>
</form>

        {message && <p className="footer__message">{message}</p>}
        <div className="footer__info">
          <p>Destination Paradise</p>
          <p>
            Phone:{" "}
            <a
              href="tel:+255748352657"
              aria-label="Call us at +255 748 352 657"
            >
              +255 748 352 657
            </a>
            <a
              href="https://wa.me/255748352657"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="footer__whatsapp-link"
            >
              <i
                className="fab fa-whatsapp footer__whatsapp-icon"
                aria-hidden="true"
              ></i>
            </a>
          </p>
          <p>
            <a
              href="mailto:info@yournexttriptoparadise.com"
              aria-label="Send us an email"
            >
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
            >
              <i className="fab fa-facebook" aria-hidden="true"></i>
            </a>
            <a
              href="https://www.instagram.com/yournexttriptoparadise/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Instagram page"
              className="footer__social-link"
            >
              <i className="fab fa-instagram" aria-hidden="true"></i>
            </a>
            <a
              href="https://www.youtube.com/@destinationparadisezanzibar"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our YouTube channel"
              className="footer__social-link"
            >
              <i className="fab fa-youtube" aria-hidden="true"></i>
            </a>
            <a
              href="https://twitter.com/destinationpar5"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Twitter page"
              className="footer__social-link"
            >
              <i className="fab fa-twitter" aria-hidden="true"></i>
            </a>
          </div>
        </div>
        <div className="footer__legal">
          <a
            href="/privacy-policy"
            aria-label="Read our Privacy Policy"
            className="footer__legal-link"
          >
            Privacy Policy
          </a>
          |
          <a
            href="/terms-of-service"
            aria-label="Read our Terms of Service"
            className="footer__legal-link"
          >
            Terms of Service
          </a>
        </div>
        <div className="footer__copyright">
          <p>&copy; 2023 Destination Paradise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
