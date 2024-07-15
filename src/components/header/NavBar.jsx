import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './NavBar.scss';
import scrollToTop from '../../utils/scrollToTop';
import logo from '../../assets/logo/dlp.png';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = useCallback((prevIsOpen) => {
    setIsOpen(prevIsOpen => !prevIsOpen);
    if (!prevIsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = 'auto';
  }, []);

  const handleScroll = useCallback(() => {
    const offset = window.scrollY;
    setIsScrolled(offset > 10);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const navClass = isScrolled ? 'nav transparent' : 'nav';

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Excursions", path: "/excursions" },
    { label: "About Us", path: "/aboutus" },
    { label: "Gallery", path: "/gallery" },
    { label: "Booking Request", path: "/booking" }
  ];

  const MenuList = ({ className, onClick }) => (
    <ul className={className}>
      {menuItems.map(item => (
        <li key={item.label}>
          <Link
            className={`menu__item ${location.pathname === item.path ? 'active' : ''}`}
            to={item.path}
            onClick={() => {
              onClick();
              closeMenu();
              scrollToTop();
            }}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  MenuList.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func,
  };

  return (
    <nav className={navClass}>
      <div className='store'>
        <Link to="/booking" onClick={closeMenu} aria-label="Book Now">
          <button><i className="fa-solid fa-store"></i>Book Now</button>
        </Link>
      </div>
      <nav className="classic-menu" aria-label="Main navigation">
        <MenuList className="classic-menu__list" onClick={closeMenu} />
      </nav>
      <div>
        <Link to="/" className="menu__logo" aria-label="Go to homepage" onClick={() => {
          closeMenu();
          scrollToTop();
        }}>
          <img src={logo} alt="Destination Paradise Logo" />
        </Link>
      </div>
      <nav className="hamburger-menu">
        <input
          id="menu__toggle"
          type="checkbox"
          checked={isOpen}
          onChange={toggleMenu}
          aria-expanded={isOpen ? 'true' : 'false'}
        />
        <label className="menu__btn" htmlFor="menu__toggle" aria-label="Toggle navigation menu">
          <span></span>
        </label>
        <div className={`menu__box ${isOpen ? 'open' : ''}`}>
          <MenuList className="hamburger-menu__list" onClick={closeMenu} />
          <div className="menu__header">
            <img src={logo} alt="Logo" className={`menu__logo ${isOpen ? 'open' : ''}`} />
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
