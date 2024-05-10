import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './NavBar.scss';
import logo from '../../assets/logo/dlp.png';

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const currentPath = window.location.pathname;

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
        { label: "Home", href: "#", path: "/" },
        { label: "Excursions", href: "#", path: "/excursions" },
        { label: "About Us", href: "#", path: "/about" },
        { label: "Gallery", href: "#", path: "/gallery" },
        { label: "Booking Request", href: "#", path: "/booking" }
    ];

    const MenuList = ({ currentPath }) => (
        <ul>
            {menuItems.map(item => (
                <li key={item.label}>
                    <a
                        className={`menu__item ${currentPath === item.path ? 'active' : ''}`}
                        href={item.href}
                    >
                        {item.label}
                    </a>
                </li>
            ))}
        </ul>
    );

    MenuList.propTypes = {
        currentPath: PropTypes.string.isRequired,
    };

    return (
        <nav className={navClass}>
            <div className='store'>
                <button><i className="fa-solid fa-store"></i>Book Now</button>
            </div>
            <div className='classic-menu'>
                <MenuList currentPath={currentPath} />
            </div>
            <div>
                <a href="#" className="menu__logo"><img src={logo} alt="Logo" /></a>
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
                    <MenuList currentPath={currentPath} />
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
