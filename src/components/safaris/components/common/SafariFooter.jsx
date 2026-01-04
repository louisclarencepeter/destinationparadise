// SafariFooter.jsx
import React from "react";
import "./SafariFooter.scss";

const SafariFooter = () => (
  <footer className="safaris-footer">
    <p>
      © {new Date().getFullYear()} Destination Paradise. All rights reserved. Prices and availability subject to change.
    </p>
  </footer>
);

export default SafariFooter;