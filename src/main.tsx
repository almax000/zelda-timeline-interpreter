import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { initLanguage } from './i18n';
import App from './App';

initLanguage().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
