// ===== LOGOUT BUTTON HANDLER =====
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Rimuovi autenticazione (sessionStorage, localStorage, Firebase se usato)
            sessionStorage.removeItem('authenticated');
            // Se usi Firebase Auth, aggiungi qui il signOut
            // firebase.auth().signOut();
            window.location.href = 'login.html';
        });
    }
});
// ===== HAMBURGER MENU =====
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
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
    }

    // ===== EASTER EGG =====
    setupEasterEgg();

    // ===== HIGHLIGHT NEXT MATCH =====
    highlightNextMatch();
    
    // ===== LOAD WEEKLY EVENTS =====
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
    const eventsList = document.getElementById('eventsList');
    const weekDatesEl = document.getElementById('weekDates');
    
    if (!eventsList || !weekDatesEl) return;
    
    const today = new Date();
    const { start, end } = getWeekRange(today);
    
    // Mostra le date della settimana
    weekDatesEl.textContent = formatWeekRange(start, end);
    
    // Filtra eventi della settimana
    const weekEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= start && eventDate <= end;
    });
    
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
