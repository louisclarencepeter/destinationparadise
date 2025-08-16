// HamburgerToggle.jsx
import PropTypes from "prop-types";
import "./HamburgerToggle.scss";

const HamburgerToggle = ({ isOpen, toggleMenu }) => {
  return (
    <button
      type="button"
      className={`hamburger-toggle ${isOpen ? "is-open" : ""}`}
      aria-expanded={isOpen}
      aria-controls="menu__box"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      onClick={toggleMenu}
    >
      {/* The three bars */}
      <span className="bars" aria-hidden="true" />
    </button>
  );
};

HamburgerToggle.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleMenu: PropTypes.func.isRequired,
};

export default HamburgerToggle;
