import PropTypes from "prop-types";
import { Link } from "react-router-dom";

/**
 * Reusable CTA Button Component
 * @param {Object} props
 * @param {string} props.href - Link destination
 * @param {string} props.children - Button text
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.state - React Router state to pass
 */
const CTAButton = ({ href, children, className = "", state = {} }) => {
  return (
    <Link 
      to={href} 
      className={`cta-button ${className}`}
      state={state}
    >
      {children}
    </Link>
  );
};

CTAButton.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  state: PropTypes.object,
};

export default CTAButton;