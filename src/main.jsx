import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { LanguageProvider } from './context/LanguageContext';
import { FriendsProvider } from './context/FriendsContext';
import { ModalProvider } from './context/ModalContext';
import App from './App.jsx';

// Diagnostic Logging for Production Debugging
window.onerror = function(message, source, lineno, colno, error) {
  console.error('[Global Error]', { message, source, lineno, colno, error: error?.stack || error });
  return false;
};

window.onunhandledrejection = function(event) {
  console.error('[Unhandled Rejection]', event.reason);
};

console.log(`[App] Initializing v${typeof APP_VERSION !== 'undefined' ? APP_VERSION : 'dev'}`);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <ModalProvider>
        <FriendsProvider>
          <App />
        </FriendsProvider>
      </ModalProvider>
    </LanguageProvider>
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
