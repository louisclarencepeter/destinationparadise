import PropTypes from "prop-types";
import "./HamburgerToggle.scss";

const HamburgerToggle = ({ isOpen, toggleMenu }) => (
  <div
    className="menu__toggle-container"
    role="button"
    aria-expanded={isOpen}
    aria-controls="menu__box"
    tabIndex={0}
    onClick={toggleMenu}
    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleMenu()}
  >
    <input id="menu__toggle" type="checkbox" checked={isOpen} onChange={toggleMenu} />
    <label
      className="menu__btn"
      htmlFor="menu__toggle"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <span></span>
    </label>
  </div>
);

HamburgerToggle.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleMenu: PropTypes.func.isRequired,
};

export default HamburgerToggle;