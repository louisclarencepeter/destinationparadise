// components/SocialLinks.jsx
import "./SocialLinks.scss";

function SocialLinks() {
  return (
    <div className="social-links">
      <a
        href="https://www.facebook.com/yournexttriptoparadise/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit our Facebook page"
        className="social-links__link"
      >
        <i className="fab fa-facebook" aria-hidden="true"></i>
      </a>
      <a
        href="https://www.instagram.com/yournexttriptoparadise/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit our Instagram page"
        className="social-links__link"
      >
        <i className="fab fa-instagram" aria-hidden="true"></i>
      </a>
      <a
        href="https://www.youtube.com/@destinationparadisezanzibar"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit our YouTube channel"
        className="social-links__link"
      >
        <i className="fab fa-youtube" aria-hidden="true"></i>
      </a>
      <a
        href="https://twitter.com/destinationpar5"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit our Twitter page"
        className="social-links__link"
      >
        <i className="fab fa-twitter" aria-hidden="true"></i>
      </a>
    </div>
  );
}

export default SocialLinks;