import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { LanguageProvider } from './context/LanguageContext';
import { FriendsProvider } from './context/FriendsContext';
import { ModalProvider } from './context/ModalContext';
import App from './App.jsx';

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
