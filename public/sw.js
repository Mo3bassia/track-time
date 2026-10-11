// This is an empty Service Worker file.
// vite-plugin-pwa will inject the service worker code when building for production.
// For development, this empty file is useful to ensure the Service Worker registration works properly.

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
