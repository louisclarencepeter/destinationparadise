import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import scrollToTop from "../../../utils/scrollToTop";
import logo from "../../../assets/logo/dlp.png";

const LogoLink = ({ className, onClick }) => (
  <Link
    to="/"
    className={className}
    aria-label="Go to homepage"
    onClick={() => {
      onClick();
      scrollToTop();
    }}
  >
    <img src={logo} alt="Destination Paradise Logo" width="100" height="40" />
  </Link>
);

LogoLink.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default LogoLink;