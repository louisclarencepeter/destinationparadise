// src/components/NavBar/components/StoreButton/StoreButton.jsx

import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "./StoreButton.scss";

export const StoreButton = ({ onClick }) => (
  <div className="store">
    <Link to="/booking" onClick={onClick} aria-label="Book Now">
      <button aria-label="Book Now">
        <i className="fa-solid fa-store" aria-hidden="true"></i>
        <span className="sr-only">Book Now</span>
      </button>
    </Link>
  </div>
);

StoreButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};