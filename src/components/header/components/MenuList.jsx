// MenuList.jsx
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import scrollToTop from "../../../utils/scrollToTop";
import "./MenuList.scss";

const DEFAULT_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Excursions", path: "/excursions" },
  { label: "About Us", path: "/aboutus" },
  { label: "Gallery", path: "/gallery" },
  { label: "Booking Request", path: "/booking" },
];

const MenuList = ({ className, onClick, items = DEFAULT_ITEMS }) => {
  const handleNavigate = () => {
    scrollToTop();
    if (onClick) onClick();
  };

  return (
    <ul className={className}>
      {items.map(({ label, path }) => (
        <li key={label}>
          <NavLink
            to={path}
            // `end` ensures exact match for "/"
            end={path === "/"}
            className={({ isActive }) =>
              `menu__item ${isActive ? "active" : ""}`
            }
            onClick={handleNavigate}
            aria-label={`Navigate to ${label}`}
          >
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

MenuList.propTypes = {
  className: PropTypes.string.isRequired,
  onClick: PropTypes.func,              // make optional
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    })
  ),
};

export default MenuList;
