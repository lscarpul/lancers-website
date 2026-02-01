// ===== LANCERS BASEBALL - CLOUD FUNCTIONS =====
// Gestione notifiche push schedulate

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.database();
const messaging = admin.messaging();

// ===== FUNZIONE PRINCIPALE: Controlla e invia notifiche schedulate =====
// Esegue ogni minuto
exports.sendScheduledNotifications = functions.pubsub
    .schedule('every 1 minutes')
    .timeZone('Europe/Rome')
    .onRun(async (context) => {
        const now = Date.now();
        console.log(`⏰ Controllo notifiche schedulate - ${new Date(now).toISOString()}`);
        
        try {
            // Ottieni tutte le notifiche schedulate
            const scheduledRef = db.ref('scheduled_notifications');
            const snapshot = await scheduledRef.once('value');
            const allScheduled = snapshot.val();
            
            if (!allScheduled) {
                console.log('📭 Nessuna notifica schedulata');
                return null;
            }
            
            let sentCount = 0;
            let errorCount = 0;
            
            // Itera su ogni giocatore
            for (const [playerNumber, notifications] of Object.entries(allScheduled)) {
                if (!notifications) continue;
                
                // Ottieni token FCM del giocatore
                const tokenSnapshot = await db.ref(`fcm_tokens/${playerNumber}`).once('value');
                const tokenData = tokenSnapshot.val();
                
                if (!tokenData || !tokenData.token) {
                    console.log(`⚠️ Nessun token per giocatore ${playerNumber}`);
                    continue;
                }
                
                const fcmToken = tokenData.token;
                
                // Controlla ogni notifica
                for (const [notificationId, notification] of Object.entries(notifications)) {
                    if (!notification || notification.sent) continue;
                    
                    // Controlla se è ora di inviare
                    if (notification.scheduledTime <= now) {
                        try {
                            // Invia notifica
                            await messaging.send({
                                token: fcmToken,
                                notification: {
                                    title: notification.title,
                                    body: notification.body
                                },
                                data: {
                                    tag: notification.tag || 'lancers-notification',
                                    eventDate: notification.eventDate || '',
                                    eventType: notification.eventType || '',
                                    url: './presenze.html'
                                },
                                android: {
                                    priority: 'high',
                                    notification: {
                                        icon: 'ic_notification',
                                        color: '#003366',
                                        clickAction: 'OPEN_APP'
                                    }
                                },
                                webpush: {
                                    headers: {
                                        Urgency: 'high'
                                    },
                                    notification: {
                                        icon: './icons/icon-192x192.png',
                                        badge: './icons/icon-192x192.png',
                                        vibrate: [200, 100, 200],
                                        requireInteraction: true,
                                        actions: [
                                            { action: 'open', title: '📋 Inserisci Presenza' },
                                            { action: 'dismiss', title: '❌ Chiudi' }
                                        ]
                                    }
                                }
                            });
                            
                            // Marca come inviata
                            await db.ref(`scheduled_notifications/${playerNumber}/${notificationId}/sent`).set(true);
                            await db.ref(`scheduled_notifications/${playerNumber}/${notificationId}/sentAt`).set(new Date().toISOString());
                            
                            console.log(`✅ Notifica inviata a ${playerNumber}: ${notification.title}`);
                            sentCount++;
                            
                        } catch (sendError) {
                            console.error(`❌ Errore invio notifica a ${playerNumber}:`, sendError.message);
                            errorCount++;
                            
                            // Se token non valido, rimuovilo
                            if (sendError.code === 'messaging/invalid-registration-token' ||
                                sendError.code === 'messaging/registration-token-not-registered') {
                                console.log(`🗑️ Rimozione token non valido per ${playerNumber}`);
                                await db.ref(`fcm_tokens/${playerNumber}`).remove();
                            }
                        }
                    }
                }
            }
            
            console.log(`📊 Riepilogo: ${sentCount} inviate, ${errorCount} errori`);
            return null;
            
        } catch (error) {
            console.error('❌ Errore generale:', error);
            return null;
        }
    });

// ===== PULIZIA: Rimuovi notifiche vecchie già inviate =====
// Esegue ogni giorno alle 3:00
exports.cleanupOldNotifications = functions.pubsub
    .schedule('0 3 * * *')
    .timeZone('Europe/Rome')
    .onRun(async (context) => {
        console.log('🧹 Pulizia notifiche vecchie...');
        
        const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 giorni fa
        
        try {
            const scheduledRef = db.ref('scheduled_notifications');
            const snapshot = await scheduledRef.once('value');
            const allScheduled = snapshot.val();
            
            if (!allScheduled) return null;
            
            let removedCount = 0;
            
            for (const [playerNumber, notifications] of Object.entries(allScheduled)) {
                if (!notifications) continue;
                
                for (const [notificationId, notification] of Object.entries(notifications)) {
                    // Rimuovi se già inviata e vecchia di 7+ giorni
                    if (notification.sent && notification.scheduledTime < cutoffTime) {
                        await db.ref(`scheduled_notifications/${playerNumber}/${notificationId}`).remove();
                        removedCount++;
                    }
                }
            }
            
            console.log(`🗑️ Rimosse ${removedCount} notifiche vecchie`);
            return null;
            
        } catch (error) {
            console.error('❌ Errore pulizia:', error);
            return null;
        }
    });

// ===== API: Invia notifica immediata (per test) =====
exports.sendTestNotification = functions.https.onRequest(async (req, res) => {
    // CORS
    res.set('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).send('');
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).send('Method not allowed');
        return;
    }
    
    const { playerNumber, title, body } = req.body;
    
    if (!playerNumber) {
        res.status(400).json({ error: 'playerNumber required' });
        return;
    }
    
    try {
        // Ottieni token
        const tokenSnapshot = await db.ref(`fcm_tokens/${playerNumber}`).once('value');
        const tokenData = tokenSnapshot.val();
        
        if (!tokenData || !tokenData.token) {
            res.status(404).json({ error: 'No FCM token for player' });
            return;
        }
        
        // Invia notifica
        await messaging.send({
            token: tokenData.token,
            notification: {
                title: title || '⚾ Test Notifica Lancers',
                body: body || 'Questa è una notifica di test!'
            },
            webpush: {
                notification: {
                    icon: './icons/icon-192x192.png',
                    vibrate: [200, 100, 200]
                }
            }
        });
        
        res.json({ success: true, message: 'Notification sent!' });
        
    } catch (error) {
        console.error('❌ Errore:', error);
        res.status(500).json({ error: error.message });
    }
});
