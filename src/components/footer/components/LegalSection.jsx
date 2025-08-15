// components/LegalSection.jsx
import "./LegalSection.scss";

function LegalSection() {
  const legalLinks = [
    { 
      href: "/privacy-policy", 
      label: "Privacy Policy",
      ariaLabel: "Read our Privacy Policy"
    },
    { 
      href: "/terms-of-service", 
      label: "Terms of Service",
      ariaLabel: "Read our Terms of Service"
    }
  ];

  return (
    <nav className="legal-section" role="navigation" aria-label="Legal information">
      <ul className="legal-section__list">
        {legalLinks.map((link, index) => (
          <li key={link.href} className="legal-section__item">
            <a
              href={link.href}
              aria-label={link.ariaLabel}
              className="legal-section__link"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default LegalSection;
