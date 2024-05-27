import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './NavBar.scss';
import scrollToTop from '../../utils/scrollToTop';
import logo from '../../assets/logo/dlp.png';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(prevIsOpen => !prevIsOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <div className='classic-menu'>
        <MenuList className="classic-menu__list" onClick={closeMenu} />
      </div>
      <div>
        <Link to="/" className="menu__logo" onClick={() => {
          closeMenu();
          scrollToTop();
        }}>
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
        <label htmlFor="menu__toggle" className="sr-only">Toggle Menu</label>
        <label className="menu__btn" htmlFor="menu__toggle">
          <span></span>
        </label>
        <div className={`menu__box ${isOpen ? 'open' : ''}`}>
          <MenuList className="hamburger-menu__list" onClick={closeMenu} />
          <div className="menu__header">
            <img src={logo} alt="Logo" className="menu__logo" />
            <div className="menu__contact">
              <p>Destination Paradise</p>
              <p>Phone: +255 748 352 657</p>
              <p>Zanzibar, Tanzania</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
