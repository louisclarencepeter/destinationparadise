// src/components/NavBar/NavBar.jsx
import { useState, useEffect, useCallback } from "react";
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
    setIsScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const firstMenuItem = document.querySelector(".hamburger-menu__list a");
      if (firstMenuItem) firstMenuItem.focus();
    }
  }, [isOpen]);

  return (
    <nav className={`nav ${isScrolled ? "transparent" : ""}`} aria-label="Main navigation">
      <StoreButton onClick={closeMenu} />
      
      <div className="classic-menu">
        <MenuList className="classic-menu__list" onClick={closeMenu} />
      </div>

      <Logo onClick={() => {
        closeMenu();
        scrollToTop();
      }} />

      <HamburgerMenu
        isOpen={isOpen}
        toggleMenu={toggleMenu}
        closeMenu={closeMenu}
      />
    </nav>
  );
};

export default NavBar;