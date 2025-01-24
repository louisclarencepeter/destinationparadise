import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import scrollToTop from "../../../utils/scrollToTop";

const MenuList = ({ className, onClick }) => {
  const location = useLocation();
  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Excursions", path: "/excursions" },
    { label: "About Us", path: "/aboutus" },
    { label: "Gallery", path: "/gallery" },
    { label: "Booking Request", path: "/booking" },
  ];

  return (
    <ul className={className} role="menubar">
      {menuItems.map(({ label, path }) => (
        <li key={label} role="none">
          <Link
            role="menuitem"
            className={`menu__item ${location.pathname === path ? "active" : ""}`}
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

export default MenuList;