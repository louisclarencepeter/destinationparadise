import React, { Suspense } from "react";
import { MenuList } from "../MenuList/MenuList";
import "./ClassicMenu.scss";

export const ClassicMenu = ({ closeMenu }) => {
  return (
    <nav className="classic-menu" aria-label="Main menu">
      <Suspense fallback={<div>Loading...</div>}>
        <MenuList className="classic-menu__list" onClick={closeMenu} />
      </Suspense>
    </nav>
  );
};