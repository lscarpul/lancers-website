// ===== LANCERS BASEBALL - FIREBASE DATABASE =====
// Database Realtime Firebase per sincronizzazione presenze

const FIREBASE_DB_URL = 'https://lancersareariservata-default-rtdb.europe-west1.firebasedatabase.app';

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
        try {
            const presenceData = {
                response: responseType,
                timestamp: new Date().toISOString()
            };
            
            // Salva su Firebase
            const response = await fetch(
                `${FIREBASE_DB_URL}/presenze/${playerNumber}/${eventDate.replace(/\-/g, '_')}.json`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(presenceData)
                }
            );
            
            if (!response.ok) throw new Error('Errore salvataggio');
            
            // Salva anche in localStorage come backup
            this.saveToLocalStorage(playerNumber, eventDate, responseType);
            
            console.log('✅ Presenza salvata su Firebase');
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
