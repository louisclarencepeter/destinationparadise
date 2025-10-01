import PropTypes from "prop-types";
import MenuList from "./MenuList";
import LogoLink from "./LogoLink";
import "./HamburgerMenuBox.scss";

const HamburgerMenuBox = ({ isOpen, closeMenu }) => (
  <div id="menu__box" className={`menu__box ${isOpen ? "open" : ""}`}>
    <MenuList className="hamburger-menu__list" onClick={closeMenu} />
    <div className="menu__header">
      <LogoLink className={`menu__logo ${isOpen ? "open" : ""}`} onClick={closeMenu} />
      <div className="menu__contact">
        <p>Destination Paradise</p>
        <p>Phone: +255 768 779 517</p>
        <p>Zanzibar, Tanzania</p>
      </div>
    </div>
  </div>
);

HamburgerMenuBox.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeMenu: PropTypes.func.isRequired,
};

export default HamburgerMenuBox;