import { useState, useEffect } from 'react';
import './NavBar.scss';
import logo from '../../assets/logo/dlp.png';

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleScroll = () => {
        const offset = window.scrollY;
        setIsScrolled(offset > 10);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <nav className={isScrolled ? 'transparent' : ''}>
            <div className='store'>
                <button href=""><i className="fa-solid fa-store"></i>Book Now</button>
            </div>
            <div>
                <a href="#" className="menu__logo"><img src={logo} alt="" /></a>
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

                <ul className={`menu__box ${isOpen ? 'open' : ''}`}>
                    <li><a className="menu__item" href="#">Home</a></li>
                    <li><a className="menu__item" href="#">Excursions</a></li>
                    <li><a className="menu__item" href="#">About Us</a></li>
                    <li><a className="menu__item" href="#">Gallery</a></li>
                    <li><a className="menu__item" href="#">Booking Request</a></li>
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;
