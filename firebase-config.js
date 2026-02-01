// ===== LANCERS BASEBALL - FIREBASE CONFIG v2 (con FCM) =====
// Database Realtime + Cloud Messaging per push notifications

const FIREBASE_DB_URL = 'https://lancersareariservata-default-rtdb.europe-west1.firebasedatabase.app';

// Configurazione Firebase completa
const firebaseConfig = {
    apiKey: "AIzaSyCjrvxjr0agc4GENkPdHrX9d3iqh4Ytf2A",
    authDomain: "lancersareariservata.firebaseapp.com",
    databaseURL: "https://lancersareariservata-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "lancersareariservata",
    storageBucket: "lancersareariservata.firebasestorage.app",
    messagingSenderId: "404382062554",
    appId: "1:404382062554:web:51dfc59f7e44e5a15e92e3",
    measurementId: "G-506DWLNGML"
};

// VAPID Key per Web Push
const VAPID_KEY = 'BIeCCCNNRDWFLYcO5MTRvwO2zE9cyF50xmKaqa_mbJFccv464CWkrBUzcGJOAo8pTfTDvTT7X08FgvAy3H4XKFQ';

console.log('🔥 Firebase config v2 loaded - FCM enabled');

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
            
            const url = `${FIREBASE_DB_URL}/presenze/${playerNumber}/${eventDate.replace(/\-/g, '_')}.json`;
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
            
            // Converti le chiavi da underscore a trattini
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

// ===== FCM - FIREBASE CLOUD MESSAGING =====

const LancersFCM = {
    messaging: null,
    token: null,
    
    // Inizializza FCM
    async init() {
        // Carica Firebase SDK dinamicamente se non presente
        if (typeof firebase === 'undefined') {
            await this.loadFirebaseSDK();
        }
        
        try {
            // Inizializza Firebase app se non già fatto
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            
            this.messaging = firebase.messaging();
            console.log('🔥 FCM inizializzato');
            return true;
        } catch (e) {
            console.error('❌ Errore init FCM:', e);
            return false;
        }
    },
    
    // Carica SDK Firebase
    loadFirebaseSDK() {
        return new Promise((resolve, reject) => {
            // Controlla se già caricato
            if (typeof firebase !== 'undefined' && firebase.messaging) {
                resolve();
                return;
            }
            
            // Timeout di 8 secondi
            const timeout = setTimeout(() => {
                reject(new Error('Timeout caricamento Firebase SDK'));
            }, 8000);
            
            const script1 = document.createElement('script');
            script1.src = 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js';
            script1.onload = () => {
                const script2 = document.createElement('script');
                script2.src = 'https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js';
                script2.onload = () => {
                    clearTimeout(timeout);
                    console.log('📦 Firebase SDK caricato');
                    resolve();
                };
                script2.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Errore caricamento firebase-messaging'));
                };
                document.head.appendChild(script2);
            };
            script1.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Errore caricamento firebase-app'));
            };
            document.head.appendChild(script1);
        });
    },
    
    // Ottieni token FCM per questo dispositivo
    async getToken() {
        if (!this.messaging) {
            await this.init();
        }
        
        try {
            // Registra il service worker FCM
            const swRegistration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
            console.log('📱 FCM SW registrato');
            
            // Richiedi token
            this.token = await this.messaging.getToken({
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: swRegistration
            });
            
            console.log('🎫 FCM Token ottenuto:', this.token.substring(0, 20) + '...');
            return this.token;
        } catch (e) {
            console.error('❌ Errore ottenimento token FCM:', e);
            return null;
        }
    },
    
    // Salva token nel database per questo giocatore
    async saveToken(playerNumber) {
        if (!this.token) {
            await this.getToken();
        }
        
        if (!this.token) {
            console.error('❌ Nessun token FCM da salvare');
            return false;
        }
        
        try {
            const url = `${FIREBASE_DB_URL}/fcm_tokens/${playerNumber}.json`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: this.token,
                    updatedAt: new Date().toISOString(),
                    userAgent: navigator.userAgent
                })
            });
            
            if (response.ok) {
                console.log('✅ Token FCM salvato per giocatore', playerNumber);
                return true;
            }
        } catch (e) {
            console.error('❌ Errore salvataggio token:', e);
        }
        return false;
    },
    
    // Schedula una notifica (salva nel database, Cloud Function la invierà)
    async scheduleNotification(playerNumber, notification) {
        const notificationId = `${notification.tag || Date.now()}`;
        
        try {
            const url = `${FIREBASE_DB_URL}/scheduled_notifications/${playerNumber}/${notificationId}.json`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: notification.title,
                    body: notification.body,
                    scheduledTime: notification.scheduledTime,
                    tag: notification.tag,
                    eventDate: notification.eventDate,
                    eventType: notification.eventType,
                    createdAt: new Date().toISOString(),
                    sent: false
                })
            });
            
            if (response.ok) {
                console.log('📅 Notifica schedulata:', notification.title);
                return true;
            }
        } catch (e) {
            console.error('❌ Errore scheduling notifica:', e);
        }
        return false;
    },
    
    // Ascolta notifiche in foreground (app aperta)
    onForegroundMessage(callback) {
        if (!this.messaging) return;
        
        this.messaging.onMessage((payload) => {
            console.log('📬 Notifica foreground:', payload);
            callback(payload);
        });
    }
};
