import React, { useState, useEffect, useCallback } from "react";
import { Logo } from "./components/Logo/Logo";
import { StoreButton } from "./components/StoreButton/StoreButton";
import { HamburgerMenu } from "./components/HamburgerMenu/HamburgerMenu";
import { ClassicMenu } from "./components/ClassicMenu/ClassicMenu";
import scrollToTop from "../../utils/scrollToTop";
import "./NavBar.scss";
import { useMediaQuery } from "react-responsive";

const SCROLL_THRESHOLD = 10;

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
    setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
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

  const isDesktopOrLaptop = useMediaQuery({
    query: "(min-width: 1024px)",
  });

  return (
    <>
      <nav
        className={`nav ${isScrolled ? "transparent" : ""}`}
        aria-label="Main navigation"
      >
        <div className="nav-left">
          <StoreButton onClick={closeMenu} />
        </div>

        {isDesktopOrLaptop && (
          <div className="nav-center">
            <ClassicMenu closeMenu={closeMenu} />
          </div>
        )}

        <div className="nav-right">
          <Logo
            onClick={() => {
              closeMenu();
              scrollToTop();
            }}
            aria-label="Home"
          />

          {!isDesktopOrLaptop && (
            <HamburgerMenu
              isOpen={isOpen}
              toggleMenu={toggleMenu}
              closeMenu={closeMenu}
            />
          )}
        </div>
      </nav>

      <div style={{ paddingTop: isScrolled ? "5rem" : "4rem" }} />
    </>
  );
};

export default NavBar;