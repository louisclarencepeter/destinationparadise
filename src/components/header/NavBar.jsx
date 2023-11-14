import { useState } from 'react';
import './Navbar.scss';
import logo from '../../assets/images/me.jpg';

// Separate the MenuItem into its own component for better readability
const MenuItem = ({ item, onClick }) => (
  <li onClick={onClick}>
    <a href={`#${item.replace(/\s+/g, '').toLowerCase()}`}>{item}</a>
  </li>
);

// This hook handles the sticky navbar functionality
const useStickyNavbar = () => {
  useState(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      window.pageYOffset >= navbar.offsetTop 
        ? navbar.classList.add('sticky')
        : navbar.classList.remove('sticky');
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
};

// The main Navbar component
const Navbar = () => {
  const [isChecked, setIsChecked] = useState(false);
  useStickyNavbar();

  const menuItems = ['Home', 'About Me', 'My Projects', 'Contact'];

  const handleMenuItemClick = () => setIsChecked(false);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <ClassicalMenu items={menuItems} onMenuItemClick={handleMenuItemClick} />
        <Hamburger isChecked={isChecked} onToggle={() => setIsChecked(!isChecked)} />
        <Logo />
        <MobileMenu items={menuItems} isChecked={isChecked} onMenuItemClick={handleMenuItemClick} />
      </div>
    </nav>
  );
};

// Separating classical menu for larger screens
const ClassicalMenu = ({ items, onMenuItemClick }) => (
  <div className="classicalmenu">
    <div className="classicalmenu-logo">
      <img src={logo} alt="logo" />
    </div>
    <ul>
      {items.map((item, index) => (
        <MenuItem key={index} item={item} onClick={onMenuItemClick} />
      ))}
    </ul>
  </div>
);

// Hamburger menu component for mobile view
const Hamburger = ({ isChecked, onToggle }) => (
  <div>
    <input 
      className="checkbox" 
      type="checkbox" 
      checked={isChecked} 
      onChange={onToggle} 
    />
    <div className="hamburger-lines" onClick={onToggle}>
      {[1, 2, 3].map((line) => <span key={line} className={`line line${line}`} />)}
    </div>
  </div>
);

// Logo component
const Logo = () => (
  <div className="logo">
    <img src={logo} alt="logo" />
  </div>
);

// Mobile menu component
const MobileMenu = ({ items, isChecked, onMenuItemClick }) => (
  <ul className={`menu-items ${isChecked ? 'show' : ''}`}>
    {items.map((item, index) => (
      <MenuItem key={index} item={item} onClick={onMenuItemClick} />
    ))}
  </ul>
);

export default Navbar;
