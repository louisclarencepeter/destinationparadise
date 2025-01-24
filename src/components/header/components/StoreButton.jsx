import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const StoreButton = ({ closeMenu }) => (
  <div className="store">
    <Link to="/booking" onClick={closeMenu} aria-label="Book Now">
      <button aria-label="Book Now">
        <i className="fa-solid fa-store" aria-hidden="true"></i>
        <span className="sr-only">Book Now</span>
      </button>
    </Link>
  </div>
);

StoreButton.propTypes = {
  closeMenu: PropTypes.func.isRequired,
};

export default StoreButton;