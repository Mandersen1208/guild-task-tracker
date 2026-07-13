import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// PWA Service Worker Registration (handles GitHub Pages subpath via BASE_URL)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}service-worker.js`.replace(/\/+/g, '/');
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('[PWA] ServiceWorker registered successfully. Scope:', registration.scope);
      })
      .catch((error) => {
        console.error('[PWA] ServiceWorker registration failed:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)