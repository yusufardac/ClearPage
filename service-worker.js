const CACHE_NAME = 'clearpage-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.css',
  '/script.js',
  '/languages.json',
  '/Assets/tabIcon.svg',
  '/Assets/settings.svg',
  '/Assets/checkboxCheckedBlack.svg',
  '/Assets/checkboxCheckedWhite.svg',
  '/Assets/checkboxUncheckedBlack.svg',
  '/Assets/checkboxUncheckedWhite.svg',
  '/Assets/closeBlack.svg',
  '/Assets/closeWhite.svg',
  '/Localization/de.json',
  '/Localization/en.json',
  '/Localization/fr.json',
  '/Localization/tr.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
