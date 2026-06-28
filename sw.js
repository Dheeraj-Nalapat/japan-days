const CACHE_NAME = 'japan-days-v4';
const ASSETS = [
  './',
  './index.html',
  './itinerary.html',
  './logistics.html',
  './explore.html',
  './visa.html',
  './checklist.html',
  './css/shared.css',
  './js/shared.js',
  './icon.svg',
  './manifest.json',
  './data/trip.yaml',
  './data/flights.yaml',
  './data/route.yaml',
  './data/itinerary.yaml',
  './data/food.yaml',
  './data/hidden-gems.yaml',
  './data/budget.yaml',
  './data/checklist.yaml',
  './data/accommodation.yaml',
  './data/locations.yaml',
  './data/visa.yaml',
  'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Noto+Serif+JP:wght@200;300;400&family=Space+Mono:wght@400;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        const fetched = fetch(event.request).then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetched;
      })
  );
});
