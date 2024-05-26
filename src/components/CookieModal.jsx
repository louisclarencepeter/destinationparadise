import PropTypes from 'prop-types';
import './CookieModal.scss';

const CookieModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="cookie-modal-overlay" onClick={onClose}>
      <div className="cookie-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cookie-modal-header">
          <h2>Privacy Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="cookie-modal-body">
          <p>This tool helps you to select and deactivate various tags/trackers/analysis tools used on this website.</p>
          <ul>
            <li>Functional: These tags enable us to analyze website usage so that we can measure and improve its performance.</li>
            <li>Marketing: Marketing/target cookies are usually used to show you advertisements that meet your interests.</li>
            <li>Essential: These tags are required for the basic functions of the website.</li>
          </ul>
        </div>
        <div className="cookie-modal-footer">
          <button onClick={onClose}>Save</button>
          <button onClick={onClose}>Deny</button>
          <button onClick={onClose}>Accept and close</button>
        </div>
      </div>
    </div>
  );
};

CookieModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CookieModal;
