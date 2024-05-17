import React from 'react';
import PropTypes from 'prop-types';
import './ErrorBoundary.scss';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
        return (
            <div className="error-container">
                <h1>Oops! Something went wrong.</h1>
                <p>We&apos;re sorry for the inconvenience. Please try again later.</p>
                <button onClick={() => window.location.reload()} className="reload-button">
                    Reload Page
                </button>
            </div>
        );
    }

    return this.props.children; 
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
