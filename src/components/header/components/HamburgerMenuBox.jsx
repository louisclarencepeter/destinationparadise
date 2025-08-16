// HamburgerMenuBox.jsx
import { useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import MenuList from "./MenuList";
import LogoLink from "./LogoLink";
import "./HamburgerMenuBox.scss";

const HamburgerMenuBox = ({ isOpen, closeMenu }) => {
  // Close on ESC
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isOpen) closeMenu();
    },
    [isOpen, closeMenu]
  );

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="hamburger-menu">
      {/* Overlay */}
      <button
        type="button"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        className={`menu__overlay ${isOpen ? "open" : ""}`}
        onClick={closeMenu}
      />

      {/* Panel */}
      <aside
        id="menu__box"
        className={`menu__box ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        <nav
          className="menu__nav"
          role="navigation"
          aria-label="Primary"
          // prevent click bubbling closing immediately if you add global handlers elsewhere
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ensure MenuList forwards className + onClick to the root UL */}
          <MenuList className="hamburger-menu__list" onClick={closeMenu} />
        </nav>

        <div className="menu__header">
          {/* Ensure LogoLink forwards className + onClick to the clickable element */}
          <LogoLink className="menu__logo" onClick={closeMenu} />
          <div className="menu__contact">
            <p>Destination Paradise</p>
            <p>Phone: +255 748 352 657</p>
            <p>Zanzibar, Tanzania</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

HamburgerMenuBox.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeMenu: PropTypes.func.isRequired,
};

export default HamburgerMenuBox;
