// components/LegalSection.jsx
import "./LegalSection.scss";

function LegalSection() {
  return (
    <div className="legal-section">
      <a
        href="/privacy-policy"
        aria-label="Read our Privacy Policy"
        className="legal-section__link"
      >
        Privacy Policy
      </a>
      |
      <a
        href="/terms-of-service"
        aria-label="Read our Terms of Service"
        className="legal-section__link"
      >
        Terms of Service
      </a>
    </div>
  );
}

export default LegalSection;