import { useState, useEffect, useCallback } from 'react';
import './NavBar.scss';
import logo from '../../assets/logo/dlp.png';

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

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
        { label: "Home", href: "#" },
        { label: "Excursions", href: "#" },
        { label: "About Us", href: "#" },
        { label: "Gallery", href: "#" },
        { label: "Booking Request", href: "#" }
    ];

    const MenuList = () => (
        <ul>
            {menuItems.map(item => (
                <li key={item.label}>
                    <a className="menu__item" href={item.href}>{item.label}</a>
                </li>
            ))}
        </ul>
    );

    return (
        <nav className={navClass}>
            <div className='store'>
                <button><i className="fa-solid fa-store"></i>Book Now</button>
            </div>
            <div className='classic-menu'>
                <MenuList />
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
                    <MenuList />
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
