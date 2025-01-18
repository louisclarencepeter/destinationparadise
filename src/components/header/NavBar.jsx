// src/components/NavBar/NavBar.jsx
import React, { useState, useEffect, useCallback } from "react";
import { MenuList } from "./components/MenuList/MenuList";
import { Logo } from "./components/Logo/Logo";
import { StoreButton } from "./components/StoreButton/StoreButton";
import { HamburgerMenu } from "./components/HamburgerMenu/HamburgerMenu";
import scrollToTop from "../../utils/scrollToTop";
import "./NavBar.scss";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleScroll = useCallback(() => {
    const scrollThreshold = 10;
    setIsScrolled(window.scrollY > scrollThreshold);
  }, []);

  // Listen for scroll events to switch navbar background or style
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Auto-focus the first menu link once the menu opens
  useEffect(() => {
    if (isOpen) {
      const firstMenuItem = document.querySelector(".hamburger-menu__list a");
      if (firstMenuItem) firstMenuItem.focus();
    }
  }, [isOpen]);

  return (
    <>
      <nav
        className={`nav ${isScrolled ? "transparent" : ""}`}
        aria-label="Main navigation"
      >
        {/* LEFT: Store Button + Desktop Menu */}
        <div className="nav-left">
          <StoreButton onClick={closeMenu} />
          <div className="classic-menu">
            <MenuList
              className="classic-menu__list"
              onClick={closeMenu}
              aria-label="Desktop navigation menu"
            />
          </div>
        </div>

        {/* CENTER: Logo */}
        <div className="nav-center">
          <Logo
            onClick={() => {
              closeMenu();
              scrollToTop();
            }}
            aria-label="Home"
          />
        </div>

        {/* RIGHT: Hamburger (mobile only) */}
        <div className="nav-right">
          <HamburgerMenu
            isOpen={isOpen}
            toggleMenu={toggleMenu}
            closeMenu={closeMenu}
          />
        </div>
      </nav>

      {/* Spacer so content doesn't hide behind the fixed nav */}
      <div style={{ paddingTop: isScrolled ? "5rem" : "4rem" }} />
    </>
  );
};

export default NavBar;
