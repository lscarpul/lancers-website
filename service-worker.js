const CACHE_NAME = 'lancers-app-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './login.html',
  './calendario.html',
  './allenamenti.html',
  './presenze.html',
  './documento.html',
  './area-personale.html',
  './gestione-presenze.html',
  './styles.css',
  './script.js',
  './firebase-config.js',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap'
];

// Installazione: scarica le risorse statiche
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  // Attiva subito il nuovo service worker
  self.skipWaiting();
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
  // Prendi controllo immediato delle pagine
  self.clients.claim();
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

// ===== GESTIONE NOTIFICHE PUSH =====

// Ricevi notifica push dal server
self.addEventListener('push', (event) => {
  console.log('📬 Push ricevuta:', event);
  
  let data = {
    title: '⚾ Lancers Baseball',
    body: 'Hai un evento in programma!',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-192x192.png',
    tag: 'lancers-reminder',
    data: { url: './presenze.html' }
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      vibrate: [200, 100, 200],
      requireInteraction: true,
      actions: [
        { action: 'open', title: '📋 Inserisci Presenza' },
        { action: 'dismiss', title: '❌ Chiudi' }
      ],
      data: data.data
    })
  );
});

// Gestisci click sulla notifica
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Click su notifica:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Apri la pagina presenze
  const urlToOpen = event.notification.data?.url || './presenze.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Cerca una finestra già aperta
        for (const client of windowClients) {
          if (client.url.includes('lancers') || client.url.includes('localhost')) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Altrimenti apri una nuova finestra
        return clients.openWindow(urlToOpen);
      })
  );
});

// Gestisci chiusura notifica
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notifica chiusa:', event.notification.tag);
});

// Ricevi messaggi dalla pagina principale
self.addEventListener('message', (event) => {
  console.log('📨 Messaggio ricevuto nel SW:', event.data);
  
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleLocalNotification(event.data.payload);
  }
  
  // Test notifica manuale
  if (event.data.type === 'SHOW_TEST_NOTIFICATION') {
    console.log('🧪 Invio notifica di test dal SW...');
    self.registration.showNotification('⚾ Test Notifica Lancers!', {
      body: '✅ Le notifiche funzionano correttamente! Riceverai promemoria per inserire le presenze.',
      icon: './icons/icon-192x192.png',
      badge: './icons/icon-192x192.png',
      tag: 'test-notification-' + Date.now(),
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: false,
      data: { url: './presenze.html' }
    }).then(() => {
      console.log('✅ Notifica di test inviata con successo');
    }).catch(err => {
      console.error('❌ Errore invio notifica:', err);
    });
  }
});

// Schedula notifica locale (senza server push)
function scheduleLocalNotification(payload) {
  const { title, body, scheduledTime, eventDate, eventType } = payload;
  
  const now = Date.now();
  const delay = scheduledTime - now;
  
  if (delay > 0) {
    setTimeout(() => {
      self.registration.showNotification(title, {
        body: body,
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-192x192.png',
        tag: `reminder-${eventDate}`,
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [
          { action: 'open', title: '📋 Inserisci Presenza' },
          { action: 'dismiss', title: '❌ Chiudi' }
        ],
        data: { url: './presenze.html', eventDate, eventType }
      });
    }, delay);
    
    console.log(`⏰ Notifica schedulata per ${new Date(scheduledTime).toLocaleString()}`);
  }
}