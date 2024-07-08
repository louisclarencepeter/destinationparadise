import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './PolicyInfo.scss';

const PolicyInfo = () => {
  const location = useLocation();
  const cookiesRef = useRef(null);
  const privacyRef = useRef(null);
  const termsRef = useRef(null);

  useEffect(() => {
    const scrollToSection = () => {
      switch (location.pathname) {
        case '/cookies-policy':
          cookiesRef.current?.scrollIntoView({ behavior: 'smooth' });
          break;
        case '/privacy-policy':
          privacyRef.current?.scrollIntoView({ behavior: 'smooth' });
          break;
        case '/terms-of-service':
          termsRef.current?.scrollIntoView({ behavior: 'smooth' });
          break;
        default:
          window.scrollTo(0, 0);
      }
    };

    scrollToSection();
  }, [location.pathname]);

  return (
    <div className="policy-info">
      <h1>Our Policies</h1>
      
      <section ref={cookiesRef} id="cookies-policy">
        <h2>Cookies Policy</h2>
        <p>
          Our Cookies Policy outlines the types of cookies we use, the purposes for which they are used, and the information they collect. It provides detailed information about our cookie practices, including how we use cookies to improve your experience, personalize content, and analyze website traffic.
        </p>
        {/* Add more details about cookies policy here */}
      </section>

      <section ref={privacyRef} id="privacy-policy">
        <h2>Privacy Policy</h2>
        <p>
          Our Privacy Policy describes how we collect, use, and protect your personal information when you visit our website or use our services. It covers the types of information we gather, the purposes for which it is used, and the measures we take to safeguard your privacy.
        </p>
        {/* Add more details about privacy policy here */}
      </section>

      <section ref={termsRef} id="terms-of-service">
        <h2>Terms of Service</h2>
        <p>
          Our Terms of Service outlines the rules and regulations governing your use of our website and services. It covers your rights and responsibilities as a user, as well as our obligations as the service provider. By using our website, you agree to abide by these terms and conditions.
        </p>
        {/* Add more details about terms of service here */}
      </section>
    </div>
  );
};

export default PolicyInfo;