import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

import "./NavBar.scss";
import scrollToTop from "../../utils/scrollToTop";
import logo from "../../assets/logo/dlp.png";

const menuItems = [
  { label: "Home", path: "/" },
  { label: "Excursions", path: "/excursions" },
  { label: "About Us", path: "/aboutus" },
  { label: "Gallery", path: "/gallery" },
  { label: "Booking Request", path: "/booking" },
];

const MenuList = ({ className, onClick }) => {
  const location = useLocation();

  return (
    <ul className={className} role="menubar">
      {menuItems.map(({ label, path }) => (
        <li key={label} role="none">
          <Link
            role="menuitem"
            className={`menu__item ${
              location.pathname === path ? "active" : ""
            }`}
            aria-current={location.pathname === path ? "page" : undefined}
            to={path}
            onClick={() => {
              onClick();
              scrollToTop();
            }}
            aria-label={`Navigate to ${label}`}
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

MenuList.propTypes = {
  className: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

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
    <div className="navbar-wrapper">
      <nav className={`nav ${isScrolled ? "scrolled" : ""}`} aria-label="Main navigation">
        <div className="store">
          <Link to="/booking" onClick={closeMenu} aria-label="Book Now">
            <button aria-label="Book Now">
              <i className="fa-solid fa-store" aria-hidden="true"></i>
              <span className="sr-only">Book Now</span>
            </button>
          </Link>
        </div>

        <div className="classic-menu">
          <MenuList className="classic-menu__list" onClick={closeMenu} />
        </div>

        <div>
          <Link
            to="/"
            className="menu__logo"
            aria-label="Go to homepage"
            onClick={() => {
              closeMenu();
              scrollToTop();
            }}
          >
            <img src={logo} alt="Destination Paradise Logo" width="100" height="40" />
          </Link>
        </div>

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
            <input id="menu__toggle" type="checkbox" checked={isOpen} onChange={toggleMenu} />
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
                src={logo}
                alt="Logo"
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
      </nav>
    </div>
  );
};

export default NavBar;