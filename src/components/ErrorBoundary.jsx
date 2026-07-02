import { Component } from 'react';
import { useLocation } from 'react-router-dom';
import ErrorBoundaryPage from '../pages/ErrorBoundaryPage.jsx';
import { captureSentryException } from '../utils/sentry.js';

const RELOAD_FLAG = 'dp-chunk-reload';

function isChunkLoadError(error) {
  if (!error) return false;
  const name = error.name || '';
  const message = error.message || '';
  if (name === 'ChunkLoadError') return true;
  return /Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    message,
  );
}

function tryAutoRecover(error) {
  if (typeof window === 'undefined') return false;
  if (!isChunkLoadError(error)) return false;
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return false;
    sessionStorage.setItem(RELOAD_FLAG, '1');
  } catch {
    // sessionStorage unavailable (private mode etc.) — fall through to a one-shot reload.
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations?.().then((regs) => {
      regs.forEach((r) => r.unregister());
    }).catch(() => {});
  }
  if (typeof caches !== 'undefined' && caches?.keys) {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
  }
  window.location.reload();
  return true;
}

class ErrorBoundaryFrame extends Component {
  state = { error: null };

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
      },
    });
    tryAutoRecover(error);
  }

  componentDidUpdate(previousProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = () => {
    try {
      sessionStorage.removeItem(RELOAD_FLAG);
    } catch {
      // ignore
    }
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      if (isChunkLoadError(this.state.error)) {
        return null;
      }
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
