import PropTypes from 'prop-types';

export const Header = ({ isVisible, headerRef }) => (
    <header className="about-header">
      <h2 
        ref={headerRef}
        className={`title ${isVisible ? 'visible' : ''}`}
      >
        About Us
      </h2>
    </header>
  );
  
  Header.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    headerRef: PropTypes.func.isRequired,
  };