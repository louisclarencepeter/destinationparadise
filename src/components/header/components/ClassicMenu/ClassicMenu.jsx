import React from "react";
import { MenuList } from "../MenuList/MenuList";

export const ClassicMenu = ({ closeMenu }) => {
  return (
    <div className="classic-menu">
      <MenuList
        className="classic-menu__list"
        onClick={closeMenu}
        aria-label="Desktop navigation menu"
      />
    </div>
  );
};