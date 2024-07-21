import PropTypes from 'prop-types';
import './CookieModal.scss';

const CookieModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="cookie-modal-overlay" onClick={onClose} role="dialog" aria-labelledby="cookie-modal-title" aria-modal="true">
      <div className="cookie-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cookie-modal-header">
          <h2 id="cookie-modal-title">Privacy Settings</h2>
          <button className="close-button" onClick={onClose} aria-label="Close Privacy Settings">×</button>
        </div>
        <div className="cookie-modal-body">
          <p>This tool helps you to select and deactivate various tags/trackers/analysis tools used on this website.</p>
          <ul>
            <li><strong>Functional:</strong> These tags enable us to analyze website usage so that we can measure and improve its performance.</li>
            <li><strong>Marketing:</strong> Marketing/target cookies are usually used to show you advertisements that meet your interests.</li>
            <li><strong>Essential:</strong> These tags are required for the basic functions of the website.</li>
          </ul>
        </div>
        <div className="cookie-modal-footer">
          <button onClick={onClose} className="button save-button" aria-label="Save Privacy Settings">Save</button>
          <button onClick={onClose} className="button deny-button" aria-label="Deny Privacy Settings">Deny</button>
          <button onClick={onClose} className="button accept-button" aria-label="Accept Privacy Settings and Close">Accept and close</button>
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
