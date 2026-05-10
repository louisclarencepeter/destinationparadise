import { Component } from 'react';
import { useLocation } from 'react-router-dom';
import ErrorBoundaryPage from '../pages/ErrorBoundaryPage.jsx';

class ErrorBoundaryFrame extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Destination Paradise error boundary caught an error:', error, errorInfo);
  }

  componentDidUpdate(previousProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return <ErrorBoundaryPage error={this.state.error} onReset={this.reset} />;
    }

    return this.props.children;
  }
}

export default function ErrorBoundary({ children }) {
  const location = useLocation();
  const resetKey = `${location.pathname}${location.search}${location.hash}`;

  return (
    <ErrorBoundaryFrame resetKey={resetKey}>
      {children}
    </ErrorBoundaryFrame>
  );
}
