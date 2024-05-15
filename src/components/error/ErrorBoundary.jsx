// components/error/ErrorBoundary.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './ErrorBoundary.scss'; // Import the SCSS file for error styles

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
        // Render a custom fallback UI
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
