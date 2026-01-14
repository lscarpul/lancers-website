// ===== LANCERS BASEBALL - DATABASE PRESENZE =====
// Usa JSONBlob.com come database gratuito online
// Tutti i dispositivi condividono lo stesso database!

const DB_CONFIG = {
    blobId: '019bba5e-34fd-7071-bc13-ccc210815846',
    apiUrl: 'https://jsonblob.com/api/jsonBlob/019bba5e-34fd-7071-bc13-ccc210815846'
};

// Cache locale per performance
let localCache = null;
let lastSync = null;

// ===== FUNZIONI DATABASE =====

// Carica tutte le presenze dal cloud
async function loadAllPresences() {
    try {
        const response = await fetch(DB_CONFIG.apiUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Errore caricamento');
        
        const data = await response.json();
        localCache = data.presenze || {};
        lastSync = new Date();
        
        console.log('✅ Presenze caricate dal cloud');
        return localCache;
    } catch (error) {
        console.error('❌ Errore caricamento cloud:', error);
        // Fallback a localStorage
        return getAllLocalPresences();
    }
}

// Salva la presenza di un giocatore
async function savePresence(playerNumber, eventDate, responseType) {
    try {
        // Prima carica i dati attuali
        const response = await fetch(DB_CONFIG.apiUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        let data = await response.json();
        
        // Inizializza struttura se non esiste
        if (!data.presenze) data.presenze = {};
        if (!data.presenze[playerNumber]) data.presenze[playerNumber] = {};
        
        // Aggiungi/aggiorna la presenza
        data.presenze[playerNumber][eventDate] = {
            response: responseType,
            timestamp: new Date().toISOString()
        };
        
        // Salva nel cloud
        const saveResponse = await fetch(DB_CONFIG.apiUrl, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!saveResponse.ok) throw new Error('Errore salvataggio');
        
        // Aggiorna cache locale
        localCache = data.presenze;
        
        // Salva anche in localStorage come backup
        saveToLocalStorage(playerNumber, eventDate, responseType);
        
        console.log('✅ Presenza salvata nel cloud');
        return true;
    } catch (error) {
        console.error('❌ Errore salvataggio cloud:', error);
        // Salva comunque in locale
        saveToLocalStorage(playerNumber, eventDate, responseType);
        return false;
    }
}

// Carica le presenze di un singolo giocatore
async function getPlayerPresences(playerNumber) {
    const all = await loadAllPresences();
    return all[playerNumber] || {};
}

// ===== FUNZIONI LOCALSTORAGE (backup) =====

function saveToLocalStorage(playerNumber, eventDate, responseType) {
    const key = `presence_${playerNumber}`;
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    existing[eventDate] = {
        response: responseType,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(existing));
}

function getAllLocalPresences() {
    const presences = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('presence_')) {
            const playerNumber = key.replace('presence_', '');
            presences[playerNumber] = JSON.parse(localStorage.getItem(key) || '{}');
        }
    }
    return presences;
}

// ===== SINCRONIZZAZIONE =====

// Sincronizza localStorage con cloud
async function syncLocalToCloud() {
    try {
        const localData = getAllLocalPresences();
        
        // Carica dati cloud
        const response = await fetch(DB_CONFIG.apiUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        let cloudData = await response.json();
        if (!cloudData.presenze) cloudData.presenze = {};
        
        // Merge: locale sovrascrive cloud per ogni giocatore/evento
        Object.entries(localData).forEach(([playerNumber, playerPresences]) => {
            if (!cloudData.presenze[playerNumber]) {
                cloudData.presenze[playerNumber] = {};
            }
            
            Object.entries(playerPresences).forEach(([date, value]) => {
                const cloudValue = cloudData.presenze[playerNumber][date];
                // Usa il valore più recente
                if (!cloudValue || new Date(value.timestamp) > new Date(cloudValue.timestamp)) {
                    cloudData.presenze[playerNumber][date] = value;
                }
            });
        });
        
        // Salva nel cloud
        await fetch(DB_CONFIG.apiUrl, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(cloudData)
        });
        
        console.log('✅ Sincronizzazione completata');
        return true;
    } catch (error) {
        console.error('❌ Errore sincronizzazione:', error);
        return false;
    }
}

// ===== EXPORT GLOBALE =====

window.LancersDB = {
    loadAll: loadAllPresences,
    save: savePresence,
    getPlayer: getPlayerPresences,
    sync: syncLocalToCloud,
    getLocal: getAllLocalPresences
};

console.log('📦 Lancers Database Online inizializzato');
console.log('🌐 Database ID:', DB_CONFIG.blobId);
