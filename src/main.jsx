import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import { afterPageLoad } from './utils/afterPageLoad.js';
import { applyTheme, readStoredTheme } from './utils/theme.js';
import { registerServiceWorker } from './utils/registerServiceWorker.js';
import { scheduleSentryInit } from './utils/sentry.js';
import './i18n/index.js';
import './styles/tokens.css';
import './styles/site-shell.css';
import './styles/reveal.css';
import './styles/components/lang-switcher.css';
import './styles/components/theme-toggle.css';

applyTheme(readStoredTheme());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);

scheduleSentryInit();
afterPageLoad(registerServiceWorker);
