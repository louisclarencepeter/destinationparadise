// src/components/NavBar/components/MenuList/MenuList.jsx

import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { menuItems } from "../../config/menuItems";
import scrollToTop from "../../../../utils/scrollToTop";
import "./MenuList.scss";

export const MenuList = ({ className, onClick }) => {
  const location = useLocation();

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