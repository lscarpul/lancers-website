// ===== SCRIPT.JS v17 - FCM FIX NON-BLOCKING =====
console.log('🚀 Script.js v17 caricato!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOMContentLoaded fired');
    
    // Ripristina sessione da localStorage se necessario
    if (localStorage.getItem('authenticated') === 'true' && !sessionStorage.getItem('authenticated')) {
        sessionStorage.setItem('authenticated', 'true');
        const savedPlayer = localStorage.getItem('playerData');
        if (savedPlayer) {
            sessionStorage.setItem('playerData', savedPlayer);
        }
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Rimuovi autenticazione da entrambi storage
            sessionStorage.removeItem('authenticated');
            sessionStorage.removeItem('playerData');
            localStorage.removeItem('authenticated');
            localStorage.removeItem('playerData');
            window.location.href = 'login.html';
        });
    }
});
// ===== HAMBURGER MENU =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍔 Hamburger menu init');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    console.log('   hamburger:', hamburger);
    console.log('   navLinks:', navLinks);

    if (hamburger && navLinks) {
        console.log('✅ Hamburger elements found, adding listener');
        hamburger.addEventListener('click', function() {
            console.log('🖱️ Hamburger clicked!');
            navLinks.classList.toggle('active');
            
            // Animate hamburger
            const spans = hamburger.querySelectorAll('span');
            spans.forEach((span, index) => {
                span.classList.toggle('active');
            });
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    } else {
        console.log('❌ Hamburger elements NOT found');
    }

    // ===== EASTER EGG =====
    setupEasterEgg();

    // ===== HIGHLIGHT NEXT MATCH =====
    highlightNextMatch();
    
    // ===== LOAD WEEKLY EVENTS =====
    console.log('📅 Calling loadWeeklyEvents...');
    loadWeeklyEvents();
});

// ===== EASTER EGG - 5 clicks on the ball =====
let easterEggClicks = 0;
let easterEggTimer = null;

function setupEasterEgg() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', function(e) {
            e.preventDefault();
            easterEggClicks++;
            
            // Reset counter after 3 seconds of no clicks
            clearTimeout(easterEggTimer);
            easterEggTimer = setTimeout(() => {
                easterEggClicks = 0;
            }, 3000);
            
            // Visual feedback
            logo.style.transform = 'scale(1.2) rotate(' + (easterEggClicks * 72) + 'deg)';
            setTimeout(() => {
                logo.style.transform = 'scale(1) rotate(0deg)';
            }, 200);
            
            // Check for easter egg
            if (easterEggClicks >= 5) {
                easterEggClicks = 0;
                // Fun animation before redirect
                logo.style.animation = 'spin 0.5s ease';
                setTimeout(() => {
                    window.location.href = 'easter-egg.html';
                }, 500);
            }
        });
        
        // Add transition for smooth animation
        logo.style.transition = 'transform 0.2s ease';
    }
}

// Add spin animation via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.5); }
        100% { transform: rotate(360deg) scale(1); }
    }
`;
document.head.appendChild(style);

// ===== DATABASE EVENTI =====
const allEvents = [
    // ===== TEST NOTIFICHE - Per verificare che funzionino =====
    // Allenamento OGGI per test immediato
    { date: '2026-02-01', type: 'training', title: '🧪 TEST Allenamento OGGI', time: '🕐 21:00', tag: '🧪 TEST' },
    // Allenamento domani (2 Feb) - notifica alle 15:30 di domani
    { date: '2026-02-02', type: 'training', title: '🧪 TEST Allenamento Domani', time: '🕐 19:30', tag: '🧪 TEST' },
    // Partita domani (2 Feb) - notifiche 1 Feb ore 10:00
    { date: '2026-02-02', type: 'friendly', title: '🧪 TEST Partita Domani', time: '🕐 15:00', tag: '🧪 TEST' },
    // Partita tra 3 giorni (4 Feb) - notifiche il 1, 2, 3 Feb alle 10:00
    { date: '2026-02-04', type: 'match-home', title: '🧪 TEST Partita 3gg', time: '🕐 11:00', tag: '🧪 TEST' },
    
    // DICEMBRE 2025
    { date: '2025-12-23', type: 'event', title: 'Partita dei Babbi Natale', time: '🎅 Evento Speciale', tag: '🎄 Evento' },
    { date: '2025-12-30', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    
    // GENNAIO 2026
    { date: '2026-01-03', type: 'tbd', title: 'Allenamento', time: '🕐 Da definire', tag: '❓ Da definire' },
    { date: '2026-01-08', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-01-13', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-01-15', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-01-20', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-01-22', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-01-27', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-01-29', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    
    // FEBBRAIO 2026
    { date: '2026-02-03', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-02-04', type: 'specific', title: 'Allenamento Specifico', time: '🎯 Sessione tecnica', tag: '🎯 Specifico' },
    { date: '2026-02-05', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-02-07', type: 'tbd', title: 'Allenamento', time: '🕐 Da definire', tag: '❓ Da definire' },
    { date: '2026-02-10', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-02-11', type: 'specific', title: 'Allenamento Specifico', time: '🎯 Sessione tecnica', tag: '🎯 Specifico' },
    { date: '2026-02-12', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-02-14', type: 'tbd', title: 'Allenamento', time: '🕐 Da definire', tag: '❓ Da definire' },
    { date: '2026-02-17', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-02-18', type: 'specific', title: 'Allenamento Specifico', time: '🎯 Sessione tecnica', tag: '🎯 Specifico' },
    { date: '2026-02-19', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-02-21', type: 'tbd', title: 'Allenamento', time: '🕐 Da definire', tag: '❓ Da definire' },
    { date: '2026-02-24', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-02-25', type: 'specific', title: 'Allenamento Specifico', time: '🎯 Sessione tecnica', tag: '🎯 Specifico' },
    { date: '2026-02-26', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-02-28', type: 'tbd', title: 'Allenamento', time: '🕐 Da definire', tag: '❓ Da definire' },
    
    // MARZO 2026
    { date: '2026-03-01', type: 'friendly', title: 'Amichevole Interna', time: '🏠 Domenica', tag: '✅ Confermata' },
    { date: '2026-03-03', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-03-04', type: 'specific', title: 'Allenamento Specifico', time: '🎯 Sessione tecnica', tag: '🎯 Specifico' },
    { date: '2026-03-05', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-03-08', type: 'friendly', title: 'vs Lucca/Phoenix/Castenaso', time: '🏠 Domenica', tag: '✅ Confermata' },
    { date: '2026-03-10', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-03-11', type: 'specific', title: 'Allenamento Specifico', time: '🎯 Sessione tecnica', tag: '🎯 Specifico' },
    { date: '2026-03-12', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-03-14', type: 'friendly', title: '@ Fortitudo', time: '✈️ Sabato', tag: '✅ Confermata' },
    { date: '2026-03-17', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-03-18', type: 'specific', title: 'Allenamento Specifico', time: '🎯 Sessione tecnica', tag: '🎯 Specifico' },
    { date: '2026-03-19', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-03-22', type: 'friendly', title: '@ Fiorentina', time: '✈️ Domenica', tag: '❔ Da confermare' },
    { date: '2026-03-24', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-03-25', type: 'specific', title: 'Allenamento Specifico', time: '🎯 Sessione tecnica', tag: '🎯 Specifico' },
    { date: '2026-03-26', type: 'training', title: 'Allenamento', time: '🕐 19:30 - 21:30', tag: '🏋️ Allenamento' },
    { date: '2026-03-29', type: 'friendly', title: 'vs Arezzo', time: '🏠 Domenica', tag: '✅ Confermata' },
    
    // APRILE 2026
    { date: '2026-04-04', type: 'event', title: 'Trekking + Grigliata', time: '🥾 Sabato', tag: '🎉 Evento squadra' },
    
    // PARTITE CAMPIONATO (Aprile - Agosto 2026)
    { date: '2026-04-12', type: 'match-home', title: 'Health & Performance S.S.D', time: '🕐 11:00', tag: '🏠 Casa' },
    { date: '2026-04-19', type: 'match-away', title: 'Livorno 1940 Baseball', time: '🕐 11:00', tag: '✈️ Trasferta' },
    { date: '2026-04-26', type: 'match-home', title: 'Longbridge 2000 B.C', time: '🕐 11:00', tag: '🏠 Casa' },
    { date: '2026-05-03', type: 'match-away', title: 'Colorno B.C.', time: '🕐 11:00', tag: '✈️ Trasferta' },
    { date: '2026-05-10', type: 'match-home', title: 'A.S.D BSC Arezzo', time: '🕐 11:00', tag: '🏠 Casa' },
    { date: '2026-05-17', type: 'match-home', title: 'Cali Roma XII', time: '🕐 11:00', tag: '🏠 Casa' },
    { date: '2026-05-30', type: 'match-away', title: 'Padule Baseball A.S.D', time: '🕐 15:00', tag: '✈️ Trasferta' },
    { date: '2026-06-07', type: 'match-away', title: 'Health & Performance S.S.D', time: '🕐 11:00', tag: '✈️ Trasferta' },
    { date: '2026-06-14', type: 'match-home', title: 'Livorno 1940 Baseball', time: '🕐 11:00', tag: '🏠 Casa' },
    { date: '2026-06-21', type: 'match-away', title: 'Longbridge 2000 B.C', time: '🕐 11:00', tag: '✈️ Trasferta' },
    { date: '2026-06-28', type: 'match-home', title: 'Colorno B.C.', time: '🕐 11:00', tag: '🏠 Casa' },
    { date: '2026-07-05', type: 'match-away', title: 'A.S.D BSC Arezzo', time: '🕐 11:00', tag: '✈️ Trasferta' },
    { date: '2026-07-12', type: 'match-away', title: 'Cali Roma XII', time: '🕐 11:00', tag: '✈️ Trasferta' },
    { date: '2026-07-26', type: 'match-home', title: 'Padule Baseball A.S.D', time: '🕐 11:00', tag: '🏠 Casa' },
];

// ===== LOAD WEEKLY EVENTS =====
function loadWeeklyEvents() {
    console.log('📅 loadWeeklyEvents() chiamata');
    const eventsList = document.getElementById('eventsList');
    const weekDatesEl = document.getElementById('weekDates');
    
    console.log('   eventsList:', eventsList);
    console.log('   weekDatesEl:', weekDatesEl);
    
    if (!eventsList || !weekDatesEl) {
        console.log('❌ Elementi non trovati, esco');
        return;
    }
    
    const today = new Date();
    console.log('   today:', today);
    const { start, end } = getWeekRange(today);
    console.log('   week range:', start, '-', end);
    
    // Mostra le date della settimana
    weekDatesEl.textContent = formatWeekRange(start, end);
    
    // Filtra eventi della settimana
    const weekEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= start && eventDate <= end;
    });
    
    console.log('   weekEvents trovati:', weekEvents.length);
    
    // Genera HTML
    if (weekEvents.length === 0) {
        eventsList.innerHTML = `
            <div class="no-events">
                <div class="emoji">😴</div>
                <p>Nessun evento questa settimana</p>
            </div>
        `;
    } else {
        eventsList.innerHTML = weekEvents.map(event => {
            const eventDate = new Date(event.date);
            const dayName = getDayName(eventDate);
            const dayNum = eventDate.getDate();
            
            return `
                <div class="event-item ${event.type}">
                    <div class="event-date-box">
                        <span class="event-day">${dayName}</span>
                        <span class="event-num">${dayNum}</span>
                    </div>
                    <div class="event-details">
                        <h3>${event.title}</h3>
                        <p>${event.time}</p>
                    </div>
                    <span class="event-type ${event.type}-tag">${event.tag}</span>
                </div>
            `;
        }).join('');
    }
}

// Ottieni range della settimana (Lunedì - Domenica)
function getWeekRange(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunedì
    
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
}

// Formatta range settimana
function formatWeekRange(start, end) {
    const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    
    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = months[start.getMonth()];
    const endMonth = months[end.getMonth()];
    const year = end.getFullYear();
    
    if (startMonth === endMonth) {
        return `${startDay} - ${endDay} ${startMonth} ${year}`;
    } else {
        return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
    }
}

// Ottieni nome giorno abbreviato
function getDayName(date) {
    const days = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];
    return days[date.getDay()];
}

// Function to highlight the next upcoming match
function highlightNextMatch() {
    const matchCards = document.querySelectorAll('.match-card:not(.recovery)');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const months = {
        'GEN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAG': 4, 'GIU': 5,
        'LUG': 6, 'AGO': 7, 'SET': 8, 'OTT': 9, 'NOV': 10, 'DIC': 11
    };

    let nextMatch = null;
    let minDiff = Infinity;

    matchCards.forEach(card => {
        const dayEl = card.querySelector('.match-date .day');
        const monthEl = card.querySelector('.match-date .month');
        const yearEl = card.querySelector('.match-date .year');

        if (dayEl && monthEl && yearEl) {
            const day = parseInt(dayEl.textContent);
            const month = months[monthEl.textContent];
            const year = parseInt(yearEl.textContent);

            const matchDate = new Date(year, month, day);
            const diff = matchDate - today;

            if (diff >= 0 && diff < minDiff) {
                minDiff = diff;
                nextMatch = card;
            }
        }
    });

    if (nextMatch) {
        nextMatch.classList.add('next-match');
        nextMatch.style.boxShadow = '0 0 0 3px #ed8936, 0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        
        // Add "Prossima partita" badge
        const badge = document.createElement('div');
        badge.className = 'next-match-badge';
        badge.textContent = '⭐ Prossima partita';
        badge.style.cssText = `
            position: absolute;
            top: -10px;
            right: 10px;
            background: #ed8936;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        `;
        nextMatch.style.position = 'relative';
        nextMatch.appendChild(badge);
    }
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==========================================
// PWA SERVICE WORKER REGISTRATION
// ==========================================
// Questo codice serve per far installare l'app e farla funzionare offline

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Usa path relativo per funzionare ovunque
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('✅ Service Worker registrato con successo! Scope:', registration.scope);
                
                // Inizializza sistema notifiche
                initNotificationSystem(registration);
            })
            .catch((err) => {
                console.error('❌ Registrazione Service Worker fallita:', err);
                // Anche se SW fallisce, prova comunque le notifiche
                initNotificationSystem(null);
            });
    });
} else {
    // Anche senza SW, prova le notifiche
    window.addEventListener('load', () => {
        initNotificationSystem(null);
    });
}

// ==========================================
// SISTEMA NOTIFICHE PRESENZE
// ==========================================

let swRegistration = null;
let notificationsScheduledThisSession = false; // Evita scheduling multipli nella stessa sessione

async function initNotificationSystem(registration) {
    swRegistration = registration;
    
    console.log('🔔 Inizializzazione sistema notifiche...');
    
    // Controlla se le notifiche sono supportate
    if (!('Notification' in window)) {
        console.log('❌ Notifiche non supportate in questo browser');
        return;
    }
    
    // Controlla lo stato attuale del permesso
    const permission = Notification.permission;
    console.log('🔔 Stato permesso notifiche:', permission);
    
    if (permission === 'granted') {
        console.log('✅ Notifiche già autorizzate');
        
        // NUOVO: Inizializza FCM e salva token
        await initFCM();
        
        // Controlla notifiche pendenti in localStorage (sistema catch-up fallback)
        await checkLocalPendingNotifications();
        
        // Schedula nuove notifiche solo se non già fatto in questa sessione
        if (!notificationsScheduledThisSession) {
            await schedulePresenceReminders();
        }
    } else if (permission === 'default') {
        console.log('📢 Mostro banner richiesta notifiche');
        // Mostra banner per richiedere permesso
        showNotificationBanner();
    } else {
        console.log('🚫 Notifiche bloccate dall\'utente');
    }
}

// ==========================================
// FIREBASE CLOUD MESSAGING (FCM)
// ==========================================

async function initFCM() {
    try {
        // Controlla se LancersFCM è disponibile
        if (typeof LancersFCM === 'undefined' || !LancersFCM) {
            console.log('⚠️ LancersFCM non disponibile, uso sistema localStorage');
            return false;
        }
        
        // Timeout per evitare blocchi
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('FCM init timeout')), 10000)
        );
        
        // Inizializza FCM con timeout
        const initPromise = (async () => {
            await LancersFCM.init();
            
            // Ottieni token
            const token = await LancersFCM.getToken();
            if (!token) {
                console.log('⚠️ Impossibile ottenere token FCM');
                return false;
            }
            
            // Salva token per il giocatore corrente
            const playerData = sessionStorage.getItem('playerData');
            if (playerData) {
                const player = JSON.parse(playerData);
                await LancersFCM.saveToken(player.number);
                console.log('✅ FCM configurato per giocatore', player.number);
            }
            
            // Gestisci notifiche in foreground
            LancersFCM.onForegroundMessage((payload) => {
                console.log('📬 Notifica foreground ricevuta');
                if (swRegistration) {
                    swRegistration.showNotification(
                        payload.notification?.title || payload.data?.title,
                        {
                            body: payload.notification?.body || payload.data?.body,
                            icon: './icons/icon-192x192.png',
                            badge: './icons/icon-192x192.png',
                            tag: payload.data?.tag || 'lancers-foreground',
                            vibrate: [200, 100, 200]
                        }
                    );
                }
            });
            
            return true;
        })();
        
        return await Promise.race([initPromise, timeout]);
    } catch (e) {
        console.error('❌ Errore inizializzazione FCM (non bloccante):', e);
        return false;
    }
}

// ==========================================
// SISTEMA NOTIFICHE CATCH-UP (localStorage)
// ==========================================

async function checkLocalPendingNotifications() {
    console.log('📬 Controllo notifiche pendenti in localStorage...');
    
    const pendingNotifications = localStorage.getItem('pendingNotifications');
    if (!pendingNotifications) {
        console.log('   Nessuna notifica pendente');
        return;
    }
    
    try {
        const notifications = JSON.parse(pendingNotifications);
        const now = Date.now();
        const remaining = [];
        let sentCount = 0;
        
        for (const notif of notifications) {
            if (notif.time <= now) {
                // Notifica scaduta - inviali subito!
                console.log(`⏰ Notifica scaduta trovata: ${notif.title}`);
                await sendLocalNotification(notif.title, notif.body, notif.tag);
                sentCount++;
            } else if (notif.time > now + (7 * 24 * 60 * 60 * 1000)) {
                // Notifica troppo vecchia (> 7 giorni nel futuro), scarta
                console.log(`🗑️ Notifica troppo lontana, scartata: ${notif.title}`);
            } else {
                // Notifica ancora nel futuro, mantienila
                remaining.push(notif);
            }
        }
        
        // Aggiorna localStorage
        if (remaining.length > 0) {
            localStorage.setItem('pendingNotifications', JSON.stringify(remaining));
        } else {
            localStorage.removeItem('pendingNotifications');
        }
        
        console.log(`📬 Notifiche inviate: ${sentCount}, rimanenti: ${remaining.length}`);
    } catch (e) {
        console.error('Errore parsing notifiche:', e);
        localStorage.removeItem('pendingNotifications');
    }
}

async function sendLocalNotification(title, body, tag) {
    try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && Notification.permission === 'granted') {
            await reg.showNotification(title, {
                body: body,
                icon: './icons/icon-192x192.png',
                badge: './icons/icon-192x192.png',
                tag: tag || 'lancers-' + Date.now(),
                vibrate: [200, 100, 200],
                requireInteraction: true,
                actions: [
                    { action: 'open', title: '📋 Inserisci Presenza' },
                    { action: 'dismiss', title: '❌ Chiudi' }
                ],
                data: { url: './presenze.html' }
            });
            return true;
        }
    } catch (e) {
        console.error('Errore invio notifica:', e);
    }
    return false;
}

function scheduleLocalNotification(title, body, time, tag) {
    console.log(`📝 Salvo notifica locale: ${title} per ${new Date(time).toLocaleString()}`);
    
    let notifications = [];
    const stored = localStorage.getItem('pendingNotifications');
    if (stored) {
        try {
            notifications = JSON.parse(stored);
        } catch (e) {
            notifications = [];
        }
    }
    
    // Evita duplicati (stesso tag)
    notifications = notifications.filter(n => n.tag !== tag);
    
    // Aggiungi nuova
    notifications.push({ title, body, time, tag });
    
    localStorage.setItem('pendingNotifications', JSON.stringify(notifications));
}

// Mostra banner per richiedere permesso notifiche
function showNotificationBanner() {
    // Non mostrare se già rifiutato permanentemente
    if (localStorage.getItem('notificationsDeclined')) {
        console.log('🔕 Utente ha già rifiutato le notifiche');
        return;
    }
    
    console.log('📢 Creo banner notifiche...');
    
    // Aspetta che la pagina sia caricata
    setTimeout(() => {
        // Rimuovi banner esistente se presente
        const existingBanner = document.getElementById('notification-banner');
        if (existingBanner) existingBanner.remove();
        
        const banner = document.createElement('div');
        banner.id = 'notification-banner';
        banner.innerHTML = `
            <div class="notification-banner-content">
                <div class="notification-banner-icon">🔔</div>
                <div class="notification-banner-text">
                    <strong>Vuoi ricevere promemoria?</strong>
                    <p>Ti avviseremo di inserire la presenza prima di ogni allenamento e partita</p>
                </div>
                <div class="notification-banner-actions">
                    <button id="acceptNotifications" class="btn-accept">Attiva</button>
                    <button id="declineNotifications" class="btn-decline">No grazie</button>
                </div>
            </div>
        `;
        banner.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 90%;
            width: 450px;
            animation: slideUp 0.4s ease;
        `;
        
        // Aggiungi stili
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from { transform: translateX(-50%) translateY(100px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            .notification-banner-content {
                display: flex;
                align-items: center;
                gap: 1rem;
                flex-wrap: wrap;
            }
            .notification-banner-icon {
                font-size: 2rem;
            }
            .notification-banner-text {
                flex: 1;
                min-width: 200px;
            }
            .notification-banner-text strong {
                display: block;
                margin-bottom: 0.25rem;
            }
            .notification-banner-text p {
                font-size: 0.85rem;
                opacity: 0.9;
                margin: 0;
            }
            .notification-banner-actions {
                display: flex;
                gap: 0.5rem;
            }
            .notification-banner-actions button {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            .btn-accept {
                background: #48bb78;
                color: white;
            }
            .btn-accept:hover {
                background: #38a169;
                transform: scale(1.05);
            }
            .btn-decline {
                background: rgba(255,255,255,0.2);
                color: white;
            }
            .btn-decline:hover {
                background: rgba(255,255,255,0.3);
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(banner);
        
        console.log('✅ Banner notifiche aggiunto al DOM');
        
        // Event listeners
        document.getElementById('acceptNotifications').addEventListener('click', async () => {
            console.log('👆 Click su Attiva notifiche');
            banner.remove();
            await requestNotificationPermission();
        });
        
        document.getElementById('declineNotifications').addEventListener('click', () => {
            console.log('👆 Click su Rifiuta notifiche');
            banner.remove();
            localStorage.setItem('notificationsDeclined', 'true');
        });
    }, 1500);
}

// Richiedi permesso notifiche
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        console.log('🔔 Permesso notifiche:', permission);
        
        if (permission === 'granted') {
            // Mostra notifica di test per confermare che funziona
            await showTestNotification();
            // Schedula i promemoria
            await schedulePresenceReminders();
        } else {
            console.log('❌ Permesso notifiche negato');
        }
    } catch (error) {
        console.error('❌ Errore richiesta permesso:', error);
    }
}

// Mostra notifica di TEST per verificare che funzioni
async function showTestNotification() {
    console.log('🧪 Invio notifica di test...');
    
    // Prova prima con il Service Worker
    if (swRegistration && swRegistration.showNotification) {
        try {
            await swRegistration.showNotification('⚾ Notifiche Attivate!', {
                body: '✅ Funziona! Riceverai promemoria per inserire le presenze prima di ogni evento.',
                icon: './icons/icon-192x192.png',
                badge: './icons/icon-192x192.png',
                tag: 'test-notification',
                vibrate: [200, 100, 200, 100, 200],
                requireInteraction: false,
                actions: [
                    { action: 'open', title: '👍 Perfetto!' }
                ]
            });
            console.log('✅ Notifica di test inviata tramite SW');
            return;
        } catch (e) {
            console.log('⚠️ SW notification fallita, provo con Notification API', e);
        }
    }
    
    // Fallback: usa Notification API direttamente
    try {
        const notification = new Notification('⚾ Notifiche Attivate!', {
            body: '✅ Funziona! Riceverai promemoria per inserire le presenze prima di ogni evento.',
            icon: './icons/icon-192x192.png',
            tag: 'test-notification',
            requireInteraction: false
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        console.log('✅ Notifica di test inviata tramite Notification API');
    } catch (e) {
        console.error('❌ Impossibile inviare notifica di test:', e);
        // Mostra almeno un alert
        alert('✅ Notifiche attivate! Riceverai promemoria prima di ogni evento.');
    }
}

// Schedula promemoria per tutti gli eventi futuri
async function schedulePresenceReminders() {
    console.log('📅 schedulePresenceReminders() chiamata');
    console.log('   - swRegistration:', swRegistration ? 'presente' : 'assente');
    console.log('   - Notification.permission:', Notification.permission);
    
    if (!swRegistration || Notification.permission !== 'granted') {
        console.log('❌ Impossibile schedulare: SW o permessi mancanti');
        return;
    }
    
    // Evita scheduling multipli nella stessa sessione
    if (notificationsScheduledThisSession) {
        console.log('⚠️ Notifiche già schedulate in questa sessione');
        return;
    }
    
    // Controlla se abbiamo già schedulato oggi
    const lastCheck = localStorage.getItem('lastNotificationSchedule');
    const today = new Date().toDateString();
    if (lastCheck === today) {
        console.log('⚠️ Notifiche già schedulate oggi');
        notificationsScheduledThisSession = true;
        return;
    }
    
    const playerData = sessionStorage.getItem('playerData');
    if (!playerData) return;
    
    const player = JSON.parse(playerData);
    const now = new Date();
    
    // Carica le presenze già inserite
    let existingPresences = {};
    try {
        const response = await fetch(`https://lancersareariservata-default-rtdb.europe-west1.firebasedatabase.app/presenze/${player.number}.json`);
        existingPresences = await response.json() || {};
    } catch (e) {
        console.log('Utilizzo presenze locali');
    }
    
    // Filtra eventi futuri che richiedono presenza
    const upcomingEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        // Evento futuro
        if (eventDate <= now) return false;
        // Tipi che richiedono presenza
        const needsPresence = ['training', 'specific', 'friendly', 'match-home', 'match-away', 'event'].includes(event.type);
        if (!needsPresence) return false;
        // Non già inserita
        const dateKey = event.date.replace(/-/g, '_');
        if (existingPresences[dateKey]) return false;
        return true;
    });
    
    console.log(`📅 Eventi senza presenza: ${upcomingEvents.length}`);
    
    let scheduledCount = 0;
    
    for (const event of upcomingEvents) {
        const eventDate = new Date(event.date);
        const isMatch = ['friendly', 'match-home', 'match-away'].includes(event.type);
        const isTraining = ['training', 'specific'].includes(event.type);
        
        if (isMatch) {
            // PARTITE: notifica 1 volta al giorno per 5 giorni prima
            const isTestEvent = event.title && event.title.includes('TEST');
            
            for (let daysBeforeMatch = 5; daysBeforeMatch >= 1; daysBeforeMatch--) {
                const notificationTime = new Date(eventDate);
                notificationTime.setDate(notificationTime.getDate() - daysBeforeMatch);
                notificationTime.setHours(10, 0, 0, 0); // Alle 10:00 del mattino
                
                // Se è già passato
                if (notificationTime <= now) {
                    // Per eventi TEST, schedula la prima notifica tra 1 minuto
                    if (isTestEvent && daysBeforeMatch === 1) {
                        notificationTime.setTime(now.getTime() + 60 * 1000);
                        console.log(`🧪 TEST: notifica partita schedulata tra 1 minuto`);
                    } else {
                        continue;
                    }
                }
                
                const eventEmoji = getEventEmoji(event.type);
                const eventTypeText = getEventTypeText(event.type);
                const dateFormatted = formatDateItalian(eventDate);
                
                const title = `${eventEmoji} Partita tra ${daysBeforeMatch} giorn${daysBeforeMatch === 1 ? 'o' : 'i'}!`;
                const body = `${eventTypeText}: ${event.title}\n📅 ${dateFormatted}\n📋 Inserisci la tua presenza!`;
                
                // Tag unico per evento+giorno
                const uniqueTag = `match-d${daysBeforeMatch}-${event.date}`;
                scheduleNotificationToSW(title, body, notificationTime, event.date, event.type, uniqueTag);
                scheduledCount++;
            }
        } else if (isTraining) {
            // ALLENAMENTI: notifica 4 ore prima
            const notificationTime = new Date(eventDate);
            // Assumiamo allenamento alle 19:30, quindi notifica alle 15:30
            notificationTime.setHours(15, 30, 0, 0);
            
            // Se è un evento TEST di oggi e l'orario è passato, schedula tra 1 minuto
            const isTestEvent = event.title && event.title.includes('TEST');
            const isToday = eventDate.toDateString() === now.toDateString();
            
            if (notificationTime <= now) {
                if (isTestEvent && isToday) {
                    // Per eventi TEST oggi, schedula tra 1 minuto
                    notificationTime.setTime(now.getTime() + 60 * 1000);
                    console.log(`🧪 TEST: notifica allenamento schedulata tra 1 minuto`);
                } else {
                    continue; // Salta notifiche normali già passate
                }
            }
            
            const eventEmoji = getEventEmoji(event.type);
            const eventTypeText = getEventTypeText(event.type);
            const dateFormatted = formatDateItalian(eventDate);
            
            const title = `${eventEmoji} Allenamento tra 4 ore!`;
            const body = `${eventTypeText}\n📅 ${dateFormatted} ore 19:30\n📋 Hai inserito la presenza?`;
            
            const uniqueTag = `training-4h-${event.date}`;
            scheduleNotificationToSW(title, body, notificationTime, event.date, event.type, uniqueTag);
            scheduledCount++;
        } else {
            // ALTRI EVENTI: notifica il giorno prima alle 18:00
            const notificationTime = new Date(eventDate);
            notificationTime.setDate(notificationTime.getDate() - 1);
            notificationTime.setHours(18, 0, 0, 0);
            
            if (notificationTime <= now) continue;
            
            const eventEmoji = getEventEmoji(event.type);
            const eventTypeText = getEventTypeText(event.type);
            const dateFormatted = formatDateItalian(eventDate);
            
            const title = `${eventEmoji} Evento domani!`;
            const body = `${eventTypeText}: ${event.title}\n📅 ${dateFormatted}`;
            
            const uniqueTag = `event-1d-${event.date}`;
            scheduleNotificationToSW(title, body, notificationTime, event.date, event.type, uniqueTag);
            scheduledCount++;
        }
    }
    
    // Segna come schedulato per oggi
    localStorage.setItem('lastNotificationSchedule', today);
    notificationsScheduledThisSession = true;
    console.log(`✅ ${scheduledCount} notifiche schedulate!`);
}

// Invia notifica schedulata - FCM + localStorage fallback
async function scheduleNotificationToSW(title, body, scheduledTime, eventDate, eventType, tag) {
    const fullTag = `${tag}-${eventDate}`;
    const time = scheduledTime.getTime();
    
    // Prova FCM (funziona anche con app chiusa)
    const playerData = sessionStorage.getItem('playerData');
    if (playerData && typeof LancersFCM !== 'undefined') {
        const player = JSON.parse(playerData);
        const fcmScheduled = await LancersFCM.scheduleNotification(player.number, {
            title,
            body,
            scheduledTime: time,
            tag: fullTag,
            eventDate,
            eventType
        });
        
        if (fcmScheduled) {
            console.log(`🔥 Notifica schedulata via FCM: ${title} - ${scheduledTime.toLocaleString()}`);
            return;
        }
    }
    
    // Fallback: localStorage (funziona solo quando app viene riaperta)
    scheduleLocalNotification(title, body, time, fullTag);
    console.log(`💾 Notifica schedulata (localStorage fallback): ${title} - ${scheduledTime.toLocaleString()}`);
}

// Helper: emoji per tipo evento
function getEventEmoji(type) {
    const emojis = {
        'training': '🏋️',
        'specific': '🎯',
        'friendly': '🤝',
        'match-home': '🏠',
        'match-away': '✈️',
        'event': '🎉'
    };
    return emojis[type] || '⚾';
}

// Helper: testo tipo evento
function getEventTypeText(type) {
    const texts = {
        'training': 'Allenamento',
        'specific': 'Allenamento Specifico',
        'friendly': 'Amichevole',
        'match-home': 'Partita in Casa',
        'match-away': 'Partita in Trasferta',
        'event': 'Evento'
    };
    return texts[type] || 'Evento';
}

// Helper: formatta data in italiano
function formatDateItalian(date) {
    const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}
