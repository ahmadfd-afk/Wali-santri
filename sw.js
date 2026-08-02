const CACHE_NAME = 'portal-wali-v1';
const urlsToCache = [
  './',
  'esan.html',
  'CompressJPEG.Online_img(192x192).png',
  'CompressJPEG.Online_img(512x512) (1).png'
];

// Install Service Worker dan simpan cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch dari cache saat offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});