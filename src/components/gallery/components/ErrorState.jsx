// src/components/gallery/components/ErrorState.jsx
import PropTypes from 'prop-types';
import './ErrorState.scss';

export const ErrorState = ({ onRetry }) => (
  <div className="error-state">
    <button onClick={onRetry}>Retry</button>
  </div>
);

ErrorState.propTypes = {
  onRetry: PropTypes.func.isRequired,
};