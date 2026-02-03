// ===== LANCERS BASEBALL - FIREBASE DATABASE =====
// Database Realtime Firebase per sincronizzazione presenze

const FIREBASE_DB_URL = 'https://lancersareariservata-default-rtdb.europe-west1.firebasedatabase.app';

console.log('🔥 Firebase config loaded - URL:', FIREBASE_DB_URL);

// ===== FUNZIONI DATABASE =====

const LancersDB = {
    // Carica tutte le presenze dal database
    async loadAll() {
        try {
            const response = await fetch(`${FIREBASE_DB_URL}/presenze.json`);
            if (!response.ok) throw new Error('Errore caricamento');
            const data = await response.json();
            return data || {};
        } catch (error) {
            console.error('❌ Errore caricamento Firebase:', error);
            // Fallback a localStorage
            return this.loadFromLocalStorage();
        }
    },

    // Salva la presenza di un giocatore
    async save(playerNumber, eventDate, responseType) {
        console.log('💾 Saving to Firebase:', { playerNumber, eventDate, responseType });
        try {
            const presenceData = {
                response: responseType,
                timestamp: new Date().toISOString()
            };
            
            // Format: /presenze/25/2026_01_15.json
            const dateKey = eventDate.replace(/-/g, '_');
            const url = `${FIREBASE_DB_URL}/presenze/${playerNumber}/${dateKey}.json`;
            console.log('📡 Firebase URL:', url);
            
            // Salva su Firebase
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(presenceData)
            });
            
            console.log('📥 Firebase response status:', response.status);
            
            if (!response.ok) throw new Error('Errore salvataggio');
            
            const result = await response.json();
            console.log('✅ Presenza salvata su Firebase:', result);
            
            // Salva anche in localStorage come backup
            this.saveToLocalStorage(playerNumber, eventDate, responseType);
            
            return true;
        } catch (error) {
            console.error('❌ Errore salvataggio Firebase:', error);
            // Fallback: salva solo in localStorage
            this.saveToLocalStorage(playerNumber, eventDate, responseType);
            return false;
        }
    },

    // Ottieni le presenze di un giocatore specifico
    async getPlayer(playerNumber) {
        try {
            const response = await fetch(`${FIREBASE_DB_URL}/presenze/${playerNumber}.json`);
            if (!response.ok) throw new Error('Errore caricamento');
            const data = await response.json();
            
            if (!data) return {};
            
            // Converti le chiavi da 2026_01_15 a 2026-01-15
            const converted = {};
            Object.entries(data).forEach(([key, value]) => {
                const dateKey = key.replace(/_/g, '-');
                converted[dateKey] = value;
            });
            return converted;
        } catch (error) {
            console.error('❌ Errore caricamento giocatore:', error);
            // Fallback a localStorage
            const storageKey = `presence_${playerNumber}`;
            return JSON.parse(localStorage.getItem(storageKey) || '{}');
        }
    },

    // Funzioni localStorage di backup
    saveToLocalStorage(playerNumber, eventDate, responseType) {
        const storageKey = `presence_${playerNumber}`;
        let responses = JSON.parse(localStorage.getItem(storageKey) || '{}');
        responses[eventDate] = {
            response: responseType,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(responses));
    },

    loadFromLocalStorage() {
        const presences = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('presence_')) {
                const playerNumber = key.replace('presence_', '');
                presences[playerNumber] = JSON.parse(localStorage.getItem(key) || '{}');
            }
        }
        return presences;
    },

    // Sincronizza localStorage con Firebase
    async syncToFirebase() {
        const localData = this.loadFromLocalStorage();
        
        for (const [playerNumber, presences] of Object.entries(localData)) {
            for (const [eventDate, data] of Object.entries(presences)) {
                await this.save(playerNumber, eventDate, data.response);
            }
        }
        
        console.log('✅ Sincronizzazione completata');
    }
};

// ===== FIREBASE CLOUD MESSAGING (FCM) =====
// Sistema per push notification quando l'app è chiusa

const LancersFCM = {
    messaging: null,
    token: null,
    swRegistration: null,
    
    // Inizializza FCM
    async init() {
        try {
            console.log('🔔 Inizializzazione FCM...');
            
            // Verifica supporto
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                console.warn('⚠️ Push notifications non supportate');
                return false;
            }
            
            // Registra il service worker FCM
            this.swRegistration = await navigator.serviceWorker.register('./firebase-messaging-sw.js', {
                scope: './'
            });
            console.log('✅ Service Worker FCM registrato');
            
            // Attendi che sia attivo
            await navigator.serviceWorker.ready;
            console.log('✅ Service Worker FCM attivo');
            
            return true;
        } catch (error) {
            console.error('❌ Errore init FCM:', error);
            return false;
        }
    },
    
    // Ottiene il token FCM per ricevere notifiche
    async getToken() {
        try {
            // Chiedi permesso notifiche
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('⚠️ Permesso notifiche negato');
                return null;
            }
            
            // Per un sistema semplificato senza Firebase SDK completo,
            // usiamo il PushManager nativo
            if (this.swRegistration) {
                const subscription = await this.swRegistration.pushManager.getSubscription();
                if (subscription) {
                    this.token = JSON.stringify(subscription);
                    console.log('✅ Token push esistente recuperato');
                    return this.token;
                }
                
                // Crea nuova sottoscrizione (richiede VAPID key per produzione)
                // Per ora usiamo un token simulato basato sul browser
                this.token = 'browser-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                console.log('✅ Token generato:', this.token);
                return this.token;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Errore getToken:', error);
            return null;
        }
    },
    
    // Salva il token FCM su Firebase per il giocatore
    async saveToken(playerNumber) {
        if (!this.token) return false;
        
        try {
            const url = `${FIREBASE_DB_URL}/fcm_tokens/${playerNumber}.json`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: this.token,
                    updated: new Date().toISOString(),
                    userAgent: navigator.userAgent
                })
            });
            
            if (response.ok) {
                console.log('✅ Token FCM salvato per giocatore', playerNumber);
                localStorage.setItem('fcm_token', this.token);
                localStorage.setItem('fcm_player', playerNumber);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Errore salvataggio token:', error);
            return false;
        }
    },
    
    // Gestisce notifiche in foreground
    onForegroundMessage(callback) {
        if (this.swRegistration) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'PUSH_NOTIFICATION') {
                    callback(event.data.payload);
                }
            });
        }
    },
    
    // Programma una notifica locale
    async scheduleNotification(playerNumber, options) {
        try {
            const notificationId = `notif-${playerNumber}-${Date.now()}`;
            
            // Salva notifica programmata in localStorage
            const scheduled = JSON.parse(localStorage.getItem('scheduledNotifications') || '[]');
            scheduled.push({
                id: notificationId,
                playerNumber: playerNumber,
                title: options.title || '⚾ Lancers Baseball',
                body: options.body || 'Hai una notifica',
                scheduledTime: options.scheduledTime || Date.now(),
                sent: false
            });
            localStorage.setItem('scheduledNotifications', JSON.stringify(scheduled));
            
            // Se il tempo è passato o è ora, mostra subito
            if (!options.scheduledTime || options.scheduledTime <= Date.now()) {
                await this.showNotification(options.title, options.body);
            }
            
            return notificationId;
        } catch (error) {
            console.error('❌ Errore programmazione notifica:', error);
            return null;
        }
    },
    
    // Mostra una notifica immediata
    async showNotification(title, body, data = {}) {
        try {
            if (Notification.permission !== 'granted') {
                const perm = await Notification.requestPermission();
                if (perm !== 'granted') return false;
            }
            
            if (this.swRegistration) {
                await this.swRegistration.showNotification(title, {
                    body: body,
                    icon: './icons/icon-192x192.png',
                    badge: './icons/icon-192x192.png',
                    tag: data.tag || 'lancers-notification',
                    vibrate: [200, 100, 200],
                    requireInteraction: true,
                    data: data
                });
                console.log('✅ Notifica mostrata:', title);
                return true;
            } else {
                // Fallback: notifica nativa
                new Notification(title, { body: body });
                return true;
            }
        } catch (error) {
            console.error('❌ Errore mostra notifica:', error);
            return false;
        }
    },
    
    // Controlla e invia notifiche programmate
    async checkScheduledNotifications() {
        try {
            const scheduled = JSON.parse(localStorage.getItem('scheduledNotifications') || '[]');
            const now = Date.now();
            let updated = false;
            
            for (const notif of scheduled) {
                if (!notif.sent && notif.scheduledTime <= now) {
                    await this.showNotification(notif.title, notif.body);
                    notif.sent = true;
                    updated = true;
                }
            }
            
            if (updated) {
                // Rimuovi notifiche già inviate
                const remaining = scheduled.filter(n => !n.sent);
                localStorage.setItem('scheduledNotifications', JSON.stringify(remaining));
            }
        } catch (error) {
            console.error('❌ Errore check notifiche:', error);
        }
    }
};

// Controlla notifiche programmate ogni minuto
setInterval(() => LancersFCM.checkScheduledNotifications(), 60000);

// Controlla subito all'avvio
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => LancersFCM.checkScheduledNotifications(), 2000);
    });
}
