import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Unregister any legacy firebase messaging service workers
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
 navigator.serviceWorker.getRegistrations().then((registrations) => {
 for (const registration of registrations) {
 if (
 registration.active?.scriptURL.includes('firebase-messaging-sw.js') ||
 registration.waiting?.scriptURL.includes('firebase-messaging-sw.js') ||
 registration.installing?.scriptURL.includes('firebase-messaging-sw.js')
 ) {
 registration.unregister();
 }
 }
 }).catch(() => {
 // Ignore service worker registration inspection errors
 });
}

// Prevent transient IndexedDB database closing/hidden errors in iframes from disrupting execution
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event?.reason?.message || String(event?.reason || '');
    if (msg.includes('Database is closing/hidden') || msg.includes('closing/hidden')) {
      console.warn('Handled transient browser database lifecycle event:', msg);
      event.preventDefault();
    }
  });
}

const updateSW = registerSW({
 onNeedRefresh() {
 // Automatically update the app when a new service worker is available
 updateSW(true);
 },
 onOfflineReady() {
 console.log('App is ready to work offline');
 },
});

createRoot(document.getElementById('root')!).render(
 <StrictMode>
 <App />
 </StrictMode>,
);
