import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import scrollToTop from "../../../utils/scrollToTop";
import "./MenuList.scss";

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
      {menuItems.map(({ label, path }) => {
        const isActive =
          path === "/"
            ? location.pathname === path // Exact match for "/"
            : location.pathname.startsWith(path); // Prefix match for others

        return (
          <li key={label} role="none">
            <Link
              role="menuitem"
              className={`menu__item ${isActive ? "active" : ""}`}
              aria-current={isActive ? "page" : undefined}
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
        );
      })}
    </ul>
  );
};

MenuList.propTypes = {
  className: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default MenuList;