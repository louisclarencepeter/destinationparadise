import { useState } from 'react';
import logo from "../../../assets/logo/dlp1.png";

export const Logo = () => {
    const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  
    return (
      <div className="logo-container">
        <div className="logo-wrapper">
          <img 
            className={`logo ${isLogoLoaded ? 'loaded' : ''}`}
            src={logo} 
            alt="Destination Paradise Logo" 
            loading="eager"
            onLoad={() => setIsLogoLoaded(true)}
          />
        </div>
      </div>
    );
  };