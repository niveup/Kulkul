/**
 * StudyHub - Main Entry Point
 * 
 * Enterprise-grade React application with:
 * - Error Boundary for crash recovery
 * - Toast notifications system
 * - Radix UI primitives
 * - Zustand state management
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';
import App from './App.jsx';
import './index.css';

// Performance monitoring (optional - for production)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // You could add performance monitoring here
  // e.g., web-vitals, Sentry, etc.
}

// Root element
const container = document.getElementById('root');

if (!container) {
  throw new Error(
    'Root element not found. Make sure there is a <div id="root"></div> in your HTML.'
  );
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>
);

// Hot Module Replacement (HMR) - Vite handles this automatically
if (import.meta.hot) {
  import.meta.hot.accept();
}
