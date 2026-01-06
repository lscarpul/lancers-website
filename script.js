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

    // ===== HIGHLIGHT NEXT MATCH =====
    highlightNextMatch();
});

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
