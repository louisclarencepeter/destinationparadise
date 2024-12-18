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
    document.body.style.overflow = isOpen ? "auto" : "hidden";
  }, [isOpen]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "auto";
  }, []);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <nav className={`nav ${isScrolled ? "transparent" : ""}`}>
      <div className="store">
        <Link to="/booking" onClick={closeMenu} aria-label="Book Now">
          <button aria-label="Book Now">
            <i className="fa-solid fa-store" aria-hidden="true"></i>
            <span className="sr-only">Book Now</span>
          </button>
        </Link>
      </div>

      <nav className="classic-menu" aria-label="Main navigation">
        <MenuList className="classic-menu__list" onClick={closeMenu} />
      </nav>
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
          <img
            src={logo}
            alt="Destination Paradise Logo"
            width="100"
            height="40"
          />
        </Link>
      </div>
      <nav className="hamburger-menu">
        <div
          className="menu__toggle-container"
          aria-expanded={isOpen ? "true" : "false"}
          aria-controls="menu__box"
        >
          <input
            id="menu__toggle"
            type="checkbox"
            checked={isOpen}
            onChange={toggleMenu}
          />
          <label
            className="menu__btn"
            htmlFor="menu__toggle"
            aria-label="Toggle navigation menu"
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
      </nav>
    </nav>
  );
};

export default NavBar;
