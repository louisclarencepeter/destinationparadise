import { Link } from 'react-router-dom';
import './CookieInfo.scss';

const CookieInfo = () => {
  return (
    <div className="cookie-info">
      <p>
        By continuing to use our website, you acknowledge that you have read and understood our 
        <Link to="/cookies-policy" rel="noopener noreferrer"> Cookies Policy</Link>, 
        <Link to="/privacy-policy" rel="noopener noreferrer"> Privacy Policy</Link>, and 
        <Link to="/terms-of-service" rel="noopener noreferrer"> Terms of Service</Link>, 
        and you consent to the practices described therein.
      </p>
    </div>
  );
};

export default CookieInfo;
