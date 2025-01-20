import React from "react";
import { MenuList } from "../MenuList/MenuList";
import "./HamburgerMenu.scss";

export const HamburgerMenu = ({ isOpen, toggleMenu, closeMenu }) => {
  return (
    <nav className="hamburger-menu">
      <input
        id="menu__toggle"
        type="checkbox"
        checked={isOpen}
        onChange={toggleMenu}
      />
      
      <label
        htmlFor="menu__toggle"
        className="menu__btn"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-controls="menu__box"
        aria-expanded={isOpen}
      >
        <span></span>
      </label>

      <div
        id="menu__box"
        className="menu__box"
        data-open={isOpen}
      >
        <MenuList
          className="hamburger-menu__list"
          onClick={closeMenu}
        />
        <address className="menu__contact">
          <p>Destination Paradise</p>
          <p>Phone: <a href="tel:+255748352657">+255 748 352 657</a></p>
          <p>Zanzibar, Tanzania</p>
        </address>
      </div>
    </nav>
  );
};