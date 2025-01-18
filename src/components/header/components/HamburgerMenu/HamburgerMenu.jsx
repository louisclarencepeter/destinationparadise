// src/components/NavBar/components/HamburgerMenu/HamburgerMenu.jsx
import PropTypes from "prop-types";
import { MenuList } from "../MenuList/MenuList";
import dlpLogo from "../../../../assets/logo/dlp.png"; // Update this path to match your logo location
import "./HamburgerMenu.scss";

export const HamburgerMenu = ({ isOpen, toggleMenu, closeMenu }) => (
  <div className="hamburger-menu">
    <div
      className="menu__toggle-container"
      role="button"
      aria-expanded={isOpen ? "true" : "false"}
      aria-controls="menu__box"
      tabIndex={0}
      onClick={toggleMenu}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleMenu()}
    >
      <input
        id="menu__toggle"
        type="checkbox"
        checked={isOpen}
        onChange={toggleMenu}
      />
      <label
        className="menu__btn"
        htmlFor="menu__toggle"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <span></span>
      </label>
    </div>

    <div id="menu__box" className={`menu__box ${isOpen ? "open" : ""}`}>
      <MenuList className="hamburger-menu__list" onClick={closeMenu} />
      <div className="menu__header">
        <img
          src={dlpLogo}
          alt="Destination Paradise Logo"
          className={`menu__logo ${isOpen ? "open" : ""}`}
          width="100"
          height="40"
        />
        <div className="menu__contact">
          <p>Destination Paradise</p>
          <p>Phone: +255 748 352 657</p>
          <p>Zanzibar, Tanzania</p>
        </div>
      </div>
    </div>
  </div>
);

HamburgerMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  closeMenu: PropTypes.func.isRequired,
};