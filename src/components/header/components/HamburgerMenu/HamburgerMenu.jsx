// src/components/NavBar/components/HamburgerMenu/HamburgerMenu.jsx
import React from "react";
import { MenuList } from "../MenuList/MenuList";
import dlpLogo from "../../../../assets/logo/dlp.png";
import "./HamburgerMenu.scss";

export const HamburgerMenu = ({ isOpen, toggleMenu, closeMenu }) => {
  return (
    <nav className="hamburger-menu">
      {/* Hidden checkbox (checkbox hack) */}
      <input
        id="menu__toggle"
        type="checkbox"
        checked={isOpen}
        onChange={toggleMenu}
      />
      
      {/* Label as the visible "hamburger" icon */}
      <label
        htmlFor="menu__toggle"
        className="menu__btn"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-controls="menu__box"
        aria-expanded={isOpen}
      >
        <span></span>
      </label>

      {/* Sliding menu container */}
      <div
        id="menu__box"
        className="menu__box"
        data-open={isOpen}
      >
        <MenuList
          className="hamburger-menu__list"
          onClick={closeMenu}
        />
        <div className="menu__header">
          <img
            src={dlpLogo}
            alt="Destination Paradise Logo"
            className="menu__logo"
            data-open={isOpen}
            width="auto"
            height="64"
            onError={(e) => {
              e.target.style.display = "none";
              console.error("Failed to load logo");
            }}
          />
          <address className="menu__contact">
            <p>Destination Paradise</p>
            <p>
              Phone: <a href="tel:+255748352657">+255 748 352 657</a>
            </p>
            <p>Zanzibar, Tanzania</p>
          </address>
        </div>
      </div>
    </nav>
  );
};
