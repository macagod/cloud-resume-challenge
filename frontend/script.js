// Typing animation
const phrases = [
    'Aspiring Cloud Engineer',
    'Junior DevOps Enthusiast',
    'AWS re/Start Graduate (2025)',
    'Part-time Dreamer, Full-time Goal Achiever'
];

let currentPhraseIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let isPaused = false;
let typingSpeed = 100;

function typeText() {
    const typedTextElement = document.querySelector('.typed-text');
    if (!typedTextElement) return;

    const currentPhrase = phrases[currentPhraseIndex];
    
    if (isPaused) {
        setTimeout(() => {
            isPaused = false;
            isDeleting = true;
            typeText();
        }, 2500);
        return;
    }
    
    if (isDeleting) {
        typedTextElement.textContent = currentPhrase.substring(0, currentCharIndex - 1);
        currentCharIndex--;
        typingSpeed = 70;
    } else {
        typedTextElement.textContent = currentPhrase.substring(0, currentCharIndex + 1);
        currentCharIndex++;
        typingSpeed = 70;
    }
    
    if (!isDeleting && currentCharIndex === currentPhrase.length) {
        isPaused = true;
    } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
    }
    
    setTimeout(typeText, typingSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(typeText, 1000);

    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Improved scroll-spy: track visible sections and pick the most relevant one
    const visibleSections = new Set();
    
    const sectionObserver = new IntersectionObserver((entries) => {
        // Update the set of visible sections
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visibleSections.add(entry.target.id);
            } else {
                visibleSections.delete(entry.target.id);
            }
        });
        
        // Determine which section should be active
        if (visibleSections.size > 0) {
            const sectionsArray = Array.from(sections).filter(s => visibleSections.has(s.id));
            
            // Find section closest to the top of viewport (accounting for navbar)
            let activeSection = sectionsArray[0];
            let minDistance = Math.abs(sectionsArray[0].getBoundingClientRect().top - 80);
            
            sectionsArray.forEach(section => {
                const distance = Math.abs(section.getBoundingClientRect().top - 80);
                if (distance < minDistance) {
                    minDistance = distance;
                    activeSection = section;
                }
            });
            
            // Update active link
            navLinks.forEach(link => {
                if (link.getAttribute('href') === `#${activeSection.id}`) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    }, { 
        rootMargin: '-80px 0px -50% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
    });
    
    sections.forEach(section => sectionObserver.observe(section));

    // Fallback for hero section at top
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY < 100) {
                    navLinks.forEach(link => {
                        if (link.getAttribute('href') === '#hero') {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // Smooth scroll
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Visitor counter
    const visitorCount = document.getElementById('visitor-count');
    
    // Function to get ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
    function getOrdinalSuffix(num) {
        const j = num % 10;
        const k = num % 100;
        
        if (j === 1 && k !== 11) {
            return num + 'st';
        }
        if (j === 2 && k !== 12) {
            return num + 'nd';
        }
        if (j === 3 && k !== 13) {
            return num + 'rd';
        }
        return num + 'th';
    }
    
    async function getAndUpdateVisitorCount() {
        if (!visitorCount) return;
        try {
            const response = await fetch('https://nbgxklqtr9.execute-api.us-east-1.amazonaws.com/Prod/hello', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('Failed to fetch visitor count');
            const data = await response.json();
            visitorCount.textContent = getOrdinalSuffix(data.count);
        } catch (error) {
            console.error('Error updating visitor count:', error);
            visitorCount.textContent = '...';
        }
    }
    getAndUpdateVisitorCount();

    // Mobile menu
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.contains('nav-open');
            navToggle.setAttribute('aria-expanded', !isOpen);
            navMenu.classList.toggle('nav-open');
            body.classList.toggle('no-scroll');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('nav-open');
                body.classList.remove('no-scroll');
            });
        });
    }
});