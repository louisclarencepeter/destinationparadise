import { useState } from 'react';
import './NavBar.scss';
import logo from '../../assets/logo/dlp1.png';

const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav >
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

export default HamburgerMenu;
