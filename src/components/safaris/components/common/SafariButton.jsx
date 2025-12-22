import React from "react";
import { useNavigate } from "react-router-dom";
import "./SafariButton.scss";

const SafariButton = ({ text, to, onClick }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <button className="safaris-button" onClick={handleClick}>
      {text}
    </button>
  );
};

export default SafariButton;