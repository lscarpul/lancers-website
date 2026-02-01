const CACHE_NAME = 'lancers-app-v13';
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
  './favicon.ico',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap'
];

// ===== IndexedDB per notifiche persistenti =====
const DB_NAME = 'lancers-notifications';
const DB_VERSION = 1;
const STORE_NAME = 'scheduled-notifications';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('scheduledTime', 'scheduledTime', { unique: false });
        store.createIndex('sent', 'sent', { unique: false });
      }
    };
  });
}

async function saveNotification(notification) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(notification);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getNotification(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getPendingNotifications() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result || [];
      const pending = all.filter(n => !n.sent);
      resolve(pending);
    };
    request.onerror = () => reject(request.error);
  });
}

async function markNotificationSent(id) {
  const notification = await getNotification(id);
  if (notification) {
    notification.sent = true;
    notification.sentAt = Date.now();
    await saveNotification(notification);
  }
}

async function clearOldNotifications() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result || [];
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      all.forEach(n => {
        if (n.sent && n.sentAt < oneWeekAgo) {
          store.delete(n.id);
        }
        if (!n.sent && n.scheduledTime < Date.now() - (24 * 60 * 60 * 1000)) {
          store.delete(n.id);
        }
      });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ===== Controlla e invia notifiche pendenti =====
async function checkAndSendNotifications() {
  console.log('🔔 Controllo notifiche pendenti...');
  
  try {
    const pending = await getPendingNotifications();
    const now = Date.now();
    let sentCount = 0;
    
    for (const notification of pending) {
      if (notification.scheduledTime <= now && notification.scheduledTime > now - (24 * 60 * 60 * 1000)) {
        try {
          await self.registration.showNotification(notification.title, {
            body: notification.body,
            icon: './icons/icon-192x192.png',
            badge: './icons/icon-192x192.png',
            tag: notification.tag,
            vibrate: [200, 100, 200],
            requireInteraction: true,
            actions: [
              { action: 'open', title: '📋 Inserisci Presenza' },
              { action: 'dismiss', title: '❌ Chiudi' }
            ],
            data: { url: './presenze.html', eventDate: notification.eventDate, eventType: notification.eventType }
          });
          
          await markNotificationSent(notification.id);
          sentCount++;
          console.log(`✅ Notifica inviata: ${notification.title}`);
        } catch (e) {
          console.error('❌ Errore invio notifica:', e);
        }
      }
    }
    
    await clearOldNotifications();
    console.log(`📬 Notifiche inviate: ${sentCount}`);
    return sentCount;
  } catch (e) {
    console.error('❌ Errore controllo notifiche:', e);
    return 0;
  }
}

// ===== INSTALLAZIONE =====
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker v12 installazione...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// ===== ATTIVAZIONE =====
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker v12 attivato!');
  event.waitUntil(
    Promise.all([
      caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }));
      }),
      self.registration.periodicSync?.register('check-notifications', {
        minInterval: 60 * 60 * 1000
      }).catch(e => console.log('Periodic sync non supportato:', e)),
      checkAndSendNotifications()
    ])
  );
  self.clients.claim();
});

// ===== FETCH =====
self.addEventListener('fetch', (event) => {
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

// ===== PERIODIC BACKGROUND SYNC =====
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic sync:', event.tag);
  if (event.tag === 'check-notifications') {
    event.waitUntil(checkAndSendNotifications());
  }
});

// ===== SYNC EVENT =====
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  if (event.tag === 'check-notifications') {
    event.waitUntil(checkAndSendNotifications());
  }
});

// ===== PUSH NOTIFICATION =====
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

// ===== CLICK NOTIFICA =====
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Click su notifica:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || './presenze.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes('lancers') || client.url.includes('localhost')) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        return clients.openWindow(urlToOpen);
      })
  );
});

// ===== CHIUSURA NOTIFICA =====
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notifica chiusa:', event.notification.tag);
});

// ===== MESSAGGI DALLA PAGINA =====
self.addEventListener('message', async (event) => {
  console.log('📨 Messaggio ricevuto nel SW:', event.data);
  
  // Schedula nuova notifica
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const payload = event.data.payload;
    const id = payload.tag || `${payload.eventDate}-${payload.eventType}-${Date.now()}`;
    
    const existing = await getNotification(id);
    if (existing && !existing.sent) {
      console.log(`⚠️ Notifica già schedulata: ${id}`);
      return;
    }
    
    await saveNotification({
      id: id,
      title: payload.title,
      body: payload.body,
      scheduledTime: payload.scheduledTime,
      eventDate: payload.eventDate,
      eventType: payload.eventType,
      tag: payload.tag,
      sent: false,
      createdAt: Date.now()
    });
    
    console.log(`💾 Notifica salvata: ${payload.title} per ${new Date(payload.scheduledTime).toLocaleString()}`);
    await checkAndSendNotifications();
  }
  
  // Richiesta di controllo notifiche
  if (event.data.type === 'CHECK_NOTIFICATIONS') {
    const count = await checkAndSendNotifications();
    if (event.source) {
      event.source.postMessage({ type: 'NOTIFICATIONS_CHECKED', count });
    }
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
  
  // Reset notifiche
  if (event.data.type === 'CLEAR_ALL_NOTIFICATIONS') {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      console.log('🗑️ Tutte le notifiche cancellate');
    } catch (e) {
      console.error('❌ Errore pulizia notifiche:', e);
    }
  }
});