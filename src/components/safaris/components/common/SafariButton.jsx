import React from "react";
import { useNavigate } from "react-router-dom";
import "./SafariButton.scss";

const SafariButton = ({ text, to, onClick, className = "" }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <button 
      className={`safaris-button ${className}`} 
      onClick={handleClick}
    >
      {text}
    </button>
  );
};

export default SafariButton;