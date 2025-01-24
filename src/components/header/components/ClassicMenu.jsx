import PropTypes from "prop-types";
import MenuList from "./MenuList";
import "./ClassicMenu.scss";

const ClassicMenu = ({ closeMenu }) => (
  <div className="classic-menu">
    <MenuList className="classic-menu__list" onClick={closeMenu} />
  </div>
);

ClassicMenu.propTypes = {
  closeMenu: PropTypes.func.isRequired,
};

export default ClassicMenu;