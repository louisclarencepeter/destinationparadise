// NavBar.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import ClassicMenu from "./components/ClassicMenu";
import StoreButton from "./components/StoreButton";
import LogoLink from "./components/LogoLink";
import HamburgerToggle from "./components/HamburgerToggle";
import HamburgerMenuBox from "./components/HamburgerMenuBox";
import "./NavBar.scss";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const rafRef = useRef(null);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  // Smart scroll state (rAF to avoid layout thrash)
  useEffect(() => {
    const threshold = 10;
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > threshold);
        rafRef.current = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Focus first interactive element inside the menu when opened
  useEffect(() => {
    if (!isOpen) return;
    const menuRoot = document.getElementById("menu__box");
    if (!menuRoot) return;
    const focusable = menuRoot.querySelector(
      'a, button, [href], [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      // slight delay to ensure panel is in DOM/painted
      const t = setTimeout(() => focusable.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  return (
    <header className="navbar-wrapper" role="banner">
      <nav
        className={`nav ${isScrolled ? "scrolled" : ""}`}
        aria-label="Main navigation"
      >
        {/* Left cluster: store CTA + desktop menu */}
        <div className="nav__left">
          <StoreButton closeMenu={closeMenu} />
          <ClassicMenu closeMenu={closeMenu} />
        </div>
