import React from "react";
import PropTypes from "prop-types";
import "./ErrorBoundary.scss";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container" role="alert" aria-live="assertive">
          <h2>Oops! Something went wrong...</h2>
          <p>We&apos;re sorry for the inconvenience. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="reload-button"
            aria-label="Reload the page"
          >
            Reload Page
          </button>
          <p>If reloading does not work, please reach us below:</p>
          <div className="footer__info">
            <p>Destination Paradise</p>
            <p>
              Phone: <a href="tel:+255748352657">+255 748 352 657</a>
              <a
                href="https://wa.me/255748352657"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                className="footer__whatsapp-link"
              >
                <i className="fab fa-whatsapp footer__whatsapp-icon" aria-hidden="true"></i>
              </a>
            </p>
            <p>Zanzibar, Tanzania</p>
            <p>
              <a href="mailto:info@yournexttriptoparadise.com" aria-label="Send us an email">
                info@yournexttriptoparadise.com
              </a>
            </p>
          </div>

          <div className="footer__contact">
            <div className="footer__social">
              <a
                href="https://www.facebook.com/yournexttriptoparadise/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Facebook page"
              >
                <i className="fab fa-facebook" aria-hidden="true"></i>
              </a>
              <a
                href="https://www.instagram.com/yournexttriptoparadise/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Instagram page"
              >
                <i className="fab fa-instagram" aria-hidden="true"></i>
              </a>
              <a
                href="https://www.youtube.com/@destinationparadisezanzibar"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our YouTube channel"
              >
                <i className="fab fa-youtube" aria-hidden="true"></i>
              </a>
              <a
                href="https://twitter.com/destinationpar5"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Twitter page"
              >
                <i className="fab fa-twitter" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
