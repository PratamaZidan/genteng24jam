import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from 'workbox-routing';
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => 
    url.origin === "https://story-api.dicoding.dev" &&
    url.pathname.startsWith("/v1/stories"),
  new NetworkFirst({
    cacheName: 'story-api-cache',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);
registerRoute(
  ({ url }) =>
    url.origin === "https://story-api.dicoding.dev" &&
    url.pathname.startsWith("/images/stories/"),
  new StaleWhileRevalidate({
    cacheName: "story-images-cache",
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);

registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new CacheFirst({ cacheName: "google-fonts" }),
);
registerRoute(
  ({ url }) =>
    url.origin === "https://cdnjs.cloudflare.com" ||
    url.origin.includes("fontawesome"),
  new CacheFirst({ cacheName: "fontawesome" }),
);

registerRoute(
  ({ url }) =>
    url.origin === "https://unpkg.com" && url.pathname.startsWith("/leaflet@"),
  new CacheFirst({
    cacheName: "leaflet-cdn-cache",
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);

registerRoute(
  ({ url }) => {
    return url.origin.includes('https://tile.openstreetmap.org');
  },
  new CacheFirst({
    cacheName: "osm-tiles-cache",
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);

self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data.json(); 
  } catch (e) {
    data = { title: event.data.text() }; 
  }

  const title = data.title || 'Notifikasi Baru';
  const options = {
    body: data.body || 'Ada pesan masuk',
    
  };

  event.waitUntil(self.registration.showNotification(title, options));
});