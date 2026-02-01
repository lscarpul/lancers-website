// ===== FIREBASE MESSAGING SERVICE WORKER =====
// Gestisce le push notification quando l'app è chiusa

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Configurazione Firebase
firebase.initializeApp({
    apiKey: "AIzaSyCjrvxjr0agc4GENkPdHrX9d3iqh4Ytf2A",
    authDomain: "lancersareariservata.firebaseapp.com",
    databaseURL: "https://lancersareariservata-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "lancersareariservata",
    storageBucket: "lancersareariservata.firebasestorage.app",
    messagingSenderId: "404382062554",
    appId: "1:404382062554:web:51dfc59f7e44e5a15e92e3"
});

const messaging = firebase.messaging();

console.log('🔥 Firebase Messaging SW caricato');

// Gestisce notifiche in background (app chiusa o in background)
messaging.onBackgroundMessage((payload) => {
    console.log('📬 Notifica in background ricevuta:', payload);
    
    const notificationTitle = payload.notification?.title || payload.data?.title || '⚾ Lancers Baseball';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || 'Hai una nuova notifica',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-192x192.png',
        tag: payload.data?.tag || 'lancers-notification',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: {
            url: payload.data?.url || './presenze.html',
            ...payload.data
        },
        actions: [
            { action: 'open', title: '📋 Apri' },
            { action: 'dismiss', title: '❌ Chiudi' }
        ]
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gestisce click sulla notifica
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Click su notifica:', event.notification.tag);
    
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || './presenze.html';
    
    if (event.action === 'dismiss') {
        return;
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Se c'è già una finestra aperta, focalizzala
            for (const client of clientList) {
                if (client.url.includes('lancers') && 'focus' in client) {
                    client.navigate(urlToOpen);
                    return client.focus();
                }
            }
            // Altrimenti apri una nuova finestra
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
