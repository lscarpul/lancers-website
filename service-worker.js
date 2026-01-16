const CACHE_NAME = 'lancers-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/login.html',
  '/calendario.html',
  '/allenamenti.html',
  '/presenze.html',
  '/documento.html',
  '/area-personale.html',
  '/gestione-presenze.html',
  '/styles.css',
  '/script.js',
  '/firebase-config.js',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap'
];

// Installazione: scarica le risorse statiche
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Attivazione: pulisce vecchie cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// Fetch: serve i file dalla cache se disponibili, altrimenti rete
self.addEventListener('fetch', (event) => {
  // Escludi le chiamate a Firebase dalla cache (devono essere live)
  if (event.request.url.includes('firebase')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});