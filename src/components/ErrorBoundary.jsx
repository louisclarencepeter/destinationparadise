import { Component } from 'react';
import { useLocation } from 'react-router';
import ErrorBoundaryPage from '../pages/ErrorBoundaryPage.jsx';
import { captureSentryException } from '../utils/sentry.js';
import { isChunkLoadError, recoverFromChunkError } from '../utils/chunkRecovery.js';

class ErrorBoundaryFrame extends Component {
  state = { error: null, recovering: false, recoveryStatus: '' };
  recoveryGeneration = 0;

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Destination Paradise error boundary caught an error:', error, errorInfo);
    captureSentryException(error, {
      contexts: {
        react: {
          componentStack: errorInfo?.componentStack,
        },
      },
      tags: {
        errorBoundary: 'root',
        chunkLoad: String(isChunkLoadError(error)),
      },
    });
    if (isChunkLoadError(error)) this.recover(false);
  }

  componentWillUnmount() {
    this.recoveryGeneration += 1;
  }

  recover = (manual) => {
    const generation = ++this.recoveryGeneration;
    this.setState({ recovering: true });
    void recoverFromChunkError({ manual }).then((recoveryStatus) => {
      if (generation !== this.recoveryGeneration) return;
      this.setState({ recovering: false, recoveryStatus });
    });
  };

  componentDidUpdate(previousProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = () => {
    this.recoveryGeneration += 1;
    this.setState({ error: null, recovering: false, recoveryStatus: '' });
  };

  retry = () => {
    if (isChunkLoadError(this.state.error)) this.recover(true);
    else this.reset();
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorBoundaryPage
          error={this.state.error}
          onReset={this.retry}
          chunkError={isChunkLoadError(this.state.error)}
          recovering={this.state.recovering}
          offline={this.state.recoveryStatus === 'offline'}
        />
      );
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
