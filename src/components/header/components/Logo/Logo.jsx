// src/components/NavBar/components/Logo/Logo.jsx

import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import logo from "../../../../assets/logo/dlp.png";
import "./Logo.scss";

export const Logo = ({ onClick }) => (
  <Link
    to="/"
    className="menu__logo"
    aria-label="Go to homepage"
    onClick={onClick}
  >
    <img
      src={logo}
      alt="Destination Paradise Logo"
      width="100"
      height="40"
    />
  </Link>
);

Logo.propTypes = {
  onClick: PropTypes.func.isRequired,
};