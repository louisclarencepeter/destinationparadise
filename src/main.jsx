import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import { applyTheme, readStoredTheme } from './utils/theme.js';
import './i18n/index.js';
import './styles/tokens.css';
import './styles/site-shell.css';
import './styles/reveal.css';
import './styles/components/lang-switcher.css';
import './styles/components/theme-toggle.css';

applyTheme(readStoredTheme());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);
