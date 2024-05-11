import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.scss';
import logo from '../../assets/logo/dlp.png';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = useCallback(() => {
    setIsOpen(prevIsOpen => !prevIsOpen);
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
    { label: "About Us", path: "/about" },
    { label: "Gallery", path: "/gallery" },
    { label: "Booking Request", path: "/booking" }
  ];

  const MenuList = ({ className }) => (
    <ul className={className}>
      {menuItems.map(item => (
        <li key={item.label}>
          <Link
            className={`menu__item ${location.pathname === item.path ? 'active' : ''}`}
            to={item.path}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  MenuList.propTypes = {
    className: PropTypes.string,
  };

  return (
    <nav className={navClass}>
      <div className='store'>
        <Link to="/booking">
          <button><i className="fa-solid fa-store"></i>Book Now</button>
        </Link>
      </div>
      <div className='classic-menu'>
        <MenuList className="classic-menu__list" />
      </div>
      <div>
        <Link to="/" className="menu__logo">
          <img src={logo} alt="Logo" />
        </Link>
      </div>
      <div className="hamburger-menu">
        <input
          id="menu__toggle"
          type="checkbox"
          checked={isOpen}
          onChange={toggleMenu}
        />
        <label className="menu__btn" htmlFor="menu__toggle">
          <span></span>
        </label>
        <div className={`menu__box ${isOpen ? 'open' : ''}`}>
          <MenuList className="hamburger-menu__list" />
          <div className="menu__header">
            <img src={logo} alt="Logo" className="menu__logo" />
            <div className="menu__contact">
              <p>Destination Paradise</p>
              <p>Phone: +255 777 777 777</p>
              <p>Zanzibar, Tanzania</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;