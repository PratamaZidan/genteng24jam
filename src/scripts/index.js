// CSS imports
import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';
import './utils/skip-to-content.js';

import App from './pages/app';
import Camera from './utils/camera';
import { registerServiceWorker } from './utils/index.js';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  await registerServiceWorker();
  console.log('Berhasil mendaftarkan service worker!');

  window.addEventListener('hashchange', async () => {
    await app.renderPage();

    Camera.stopAllStreams();
  });
});
