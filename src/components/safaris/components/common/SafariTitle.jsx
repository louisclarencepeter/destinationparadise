import React from "react";

const SafariTitle = React.forwardRef(({ isVisible }, ref) => (
  <h2 ref={ref} className={`title ${isVisible ? "visible" : ""}`}>
    Safaris
  </h2>
));

export default SafariTitle;