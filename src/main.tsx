import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './app/i18n';
import './styles/app.css';
import './shared/theme/tokens.css';
import './shared/theme/heatmap.css';
import './shared/theme/home.css';
import { App } from './app/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><HashRouter><App /></HashRouter></React.StrictMode>
);

// Delay PWA SW registration until after Home's first paint. This keeps
// offline behavior intact without the render-blocking registerSW.js request.
// The SW upgrade policy remains prompt-controlled (no skipWaiting call).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const register = () => {
      void navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js',
        {scope: import.meta.env.BASE_URL}).catch(() => {
          // Offline registration failure must not block typing; surfaced in
          // application storage/offline indicators separately.
        });
    };
    if ('requestIdleCallback' in window) window.requestIdleCallback(register, {timeout: 4000});
    else window.setTimeout(register, 1500);
  }, {once: true});
}
