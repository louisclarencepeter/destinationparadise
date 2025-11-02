import PropTypes from "prop-types";

/**
 * Reusable CTA Button Component
 * @param {Object} props
 * @param {string} props.href - Link destination
 * @param {string} props.children - Button text
 * @param {string} props.className - Additional CSS classes
 */
const CTAButton = ({ href, children, className = "" }) => {
  return (
    <a href={href} className={`cta-button ${className}`}>
      {children}
    </a>
  );
};

CTAButton.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default CTAButton;