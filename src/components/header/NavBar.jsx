import { useState, useEffect, useCallback } from "react";
import ClassicMenu from "./components/ClassicMenu";
import StoreButton from "./components/StoreButton";
import LogoLink from "./components/LogoLink";
import HamburgerToggle from "./components/HamburgerToggle";
import HamburgerMenuBox from "./components/HamburgerMenuBox";
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

  useEffect(() => {
    const handleScroll = () => {
      const threshold = 10;
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const firstMenuItem = document.querySelector(".hamburger-menu__list a");
      firstMenuItem?.focus();
    }
  }, [isOpen]);

  return (
    <div className="navbar-wrapper">
      <nav className={`nav ${isScrolled ? "scrolled" : ""}`} aria-label="Main navigation">
        <StoreButton closeMenu={closeMenu} />
        <ClassicMenu closeMenu={closeMenu} />
        
        <div>
          <LogoLink className="menu__logo" onClick={closeMenu} />
        </div>

        <div className="hamburger-menu">
          <HamburgerToggle isOpen={isOpen} toggleMenu={toggleMenu} />
          <HamburgerMenuBox isOpen={isOpen} closeMenu={closeMenu} />
        </div>
      </nav>
    </div>
  );
};

export default NavBar;