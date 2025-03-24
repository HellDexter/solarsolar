/**
 * CARPORTbusiness - Hlavní JavaScript soubor
 */

// Zajištění, že se kód spustí až po načtení DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inicializace všech komponent
    initNavbar();
    initSmoothScroll();
    initROICalculator();
    initContactForm();
    animateOnScroll(); // Přidáno volání animační funkce
    initDirectionalHover(); // Přidáno volání funkce pro efekt podtržení
    initScrollToTopButton(); // Přidáno volání funkce pro tlačítko návratu nahoru
    initHighlightGlow(); // Přidáno volání funkce pro glow efekt u zvýrazněných textů
    initScrollDownButton(); // Přidáno volání funkce pro animované scroll-down tlačítko
    initAboutVideo(); // Přidáno volání funkce pro automatické přehrávání videa v sekci O nás
    
    // Přidání detekce směru scrollování
    window.addEventListener('scroll', handleScrollDirection);
    
    // Počáteční kontrola aktivní sekce
    handleScrollDirection();
    
    // Přehrávání videa o konstrukci
    const constructionVideo = document.getElementById('constructionVideo');
    if (constructionVideo) {
        constructionVideo.play().catch((error) => {
            console.log("Video autoplay failed:", error);
        });
    }
    
    // Lightbox pro galerii
    // Vytvořit lightbox element pokud ještě neexistuje
    if (!document.querySelector('.lightbox')) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        
        const lightboxImg = document.createElement('img');
        lightbox.appendChild(lightboxImg);
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'lightbox-close';
        closeBtn.innerHTML = '&times;';
        lightbox.appendChild(closeBtn);
        
        document.body.appendChild(lightbox);
        
        // Událost pro zavření lightboxu
        closeBtn.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });
        
        // Zavřít lightbox také při kliknutí kamkoli v lightboxu
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });
    }
    
    // Přidat event listener pro všechny items v galerii
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox.querySelector('img');
    
    for (const item of galleryItems) {
        item.addEventListener('click', () => {
            const imgSrc = item.getAttribute('data-src');
            lightboxImg.src = imgSrc;
            lightbox.style.display = 'block';
        });
    }
});

/**
 * Inicializace navigačního panelu s efektem při scrollování
 */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Zvýraznění aktivní položky v menu podle sekce
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            
            for (const section of sections) {
                const sectionTop = section.offsetTop;
                if (scrollY >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            }

            for (const link of navLinks) {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href?.includes(current) && current !== '') {
                    link.classList.add('active');
                }
            }
        });
    }
}

/**
 * Inicializace plynulého posunu při kliknutí na odkaz v menu
 */
function initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    for (const anchor of anchors) {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Zavření mobilního menu při kliknutí
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse?.classList.contains('show')) {
                    const navbarToggler = document.querySelector('.navbar-toggler');
                    navbarToggler?.click();
                }
            }
        });
    }
}

/**
 * Inicializace a funkce ROI kalkulačky
 */
function initROICalculator() {
    const roiForm = document.getElementById('roi-calculator');
    if (!roiForm) return;

    roiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Získání hodnot z formuláře
        const parkingSpotsEl = document.getElementById('parking-spots');
        const solarPowerEl = document.getElementById('solar-power');
        const electricityPriceEl = document.getElementById('electricity-price');
        
        if (!parkingSpotsEl || !solarPowerEl || !electricityPriceEl) {
            console.error('Některé prvky formuláře nebyly nalezeny');
            return;
        }
        
        const parkingSpots = Number.parseFloat(parkingSpotsEl.value);
        const solarPower = Number.parseFloat(solarPowerEl.value);
        const electricityPrice = Number.parseFloat(electricityPriceEl.value);
        
        // Kontrola, zda jsou všechna pole platná
        if (Number.isNaN(parkingSpots) || Number.isNaN(solarPower) || Number.isNaN(electricityPrice) || 
            !Number.isFinite(parkingSpots) || !Number.isFinite(solarPower) || !Number.isFinite(electricityPrice)) {
            const lang = document.documentElement.lang || 'cs';
            alert(lang === 'en' 
                ? 'Please fill all fields with valid numbers.' 
                : lang === 'de' 
                    ? 'Bitte füllen Sie alle Felder mit gültigen Zahlen aus.'
                    : 'Prosím, vyplňte všechna pole platnými čísly.');
            return;
        }
        
        // Konstanty pro výpočet (přizpůsobte podle reálných hodnot)
        const areaPerSpot = 15; // m² na jedno parkovací místo
        const efficiencyFactor = 0.18; // účinnost solárních panelů (18%)
        const installationCostPerM2 = 5000; // Kč za m² instalace
        const daysPerYear = 365;
        const co2PerKWh = 0.5; // kg CO2 na kWh
        
        // Výpočty
        const totalArea = parkingSpots * areaPerSpot;
        const dailyEnergyProduction = totalArea * solarPower * efficiencyFactor;
        const annualEnergyProduction = dailyEnergyProduction * daysPerYear;
        const annualSavings = annualEnergyProduction * electricityPrice;
        const totalInstallationCost = totalArea * installationCostPerM2;
        const roiYears = totalInstallationCost / annualSavings;
        const annualCO2Reduction = annualEnergyProduction * co2PerKWh;
        
        // Zobrazení výsledků
        const lang = document.documentElement.lang || 'cs';
        const isEnglish = lang === 'en';
        const isGerman = lang === 'de';
        
        const annualSavingsEl = document.getElementById('annual-savings');
        const roiYearsEl = document.getElementById('roi-years');
        const annualEnergyEl = document.getElementById('annual-energy');
        const co2ReductionEl = document.getElementById('co2-reduction');
        const roiResultEl = document.getElementById('roi-result');
        
        if (!annualSavingsEl || !roiYearsEl || !annualEnergyEl || !co2ReductionEl || !roiResultEl) {
            console.error('Některé prvky výsledku nebyly nalezeny');
            return;
        }
        
        annualSavingsEl.textContent = isEnglish 
            ? `$${annualSavings.toLocaleString('en-US', {maximumFractionDigits: 0})}`
            : isGerman
                ? `${annualSavings.toLocaleString('de-DE', {maximumFractionDigits: 0})} €`
                : `${annualSavings.toLocaleString('cs-CZ', {maximumFractionDigits: 0})} Kč`;
        
        roiYearsEl.textContent = isEnglish
            ? `${roiYears.toLocaleString('en-US', {maximumFractionDigits: 1})} years`
            : isGerman
                ? `${roiYears.toLocaleString('de-DE', {maximumFractionDigits: 1})} Jahre`
                : `${roiYears.toLocaleString('cs-CZ', {maximumFractionDigits: 1})} let`;
        
        annualEnergyEl.textContent = isEnglish
            ? `${annualEnergyProduction.toLocaleString('en-US', {maximumFractionDigits: 0})} kWh`
            : isGerman
                ? `${annualEnergyProduction.toLocaleString('de-DE', {maximumFractionDigits: 0})} kWh`
                : `${annualEnergyProduction.toLocaleString('cs-CZ', {maximumFractionDigits: 0})} kWh`;
        
        co2ReductionEl.textContent = isEnglish
            ? `${annualCO2Reduction.toLocaleString('en-US', {maximumFractionDigits: 0})} kg`
            : isGerman
                ? `${annualCO2Reduction.toLocaleString('de-DE', {maximumFractionDigits: 0})} kg`
                : `${annualCO2Reduction.toLocaleString('cs-CZ', {maximumFractionDigits: 0})} kg`;
        
        // Zobrazení výsledkového kontejneru
        roiResultEl.style.display = 'block';
    });
}

/**
 * Inicializace kontaktního formuláře
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validace formuláře
        const nameEl = document.getElementById('name');
        const emailEl = document.getElementById('email');
        const messageEl = document.getElementById('message');
        
        if (!nameEl || !emailEl || !messageEl) {
            console.error('Některé prvky formuláře nebyly nalezeny');
            return;
        }
        
        const name = nameEl.value.trim();
        const email = emailEl.value.trim();
        const message = messageEl.value.trim();
        
        const lang = document.documentElement.lang || 'cs';
        
        if (!name || !email || !message) {
            alert(lang === 'en' 
                ? 'Please fill in all required fields.' 
                : lang === 'de'
                    ? 'Bitte füllen Sie alle Pflichtfelder aus.'
                    : 'Prosím, vyplňte všechna povinná pole.');
            return;
        }
        
        if (!isValidEmail(email)) {
            alert(lang === 'en' 
                ? 'Please enter a valid email address.' 
                : lang === 'de'
                    ? 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
                    : 'Prosím, zadejte platnou e-mailovou adresu.');
            return;
        }
        
        // Simulace odeslání formuláře (zde by byl AJAX požadavek na backend)
        alert(lang === 'en' 
            ? 'Thank you for your message. We will contact you soon!' 
            : lang === 'de'
                ? 'Vielen Dank für Ihre Nachricht. Wir werden uns bald bei Ihnen melden!' 
                : 'Děkujeme za Vaši zprávu. Budeme Vás brzy kontaktovat!');
        
        // Reset formuláře
        contactForm.reset();
    });
}

/**
 * Pomocná funkce pro validaci e-mailu
 */
function isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Animace při scrollování - prvky se objevují postupně
 */
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (elements.length === 0) return;
    
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };
    
    const handleScroll = () => {
        for (const element of elements) {
            if (isInViewport(element)) {
                element.classList.add('visible');
            }
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Spuštění při načtení stránky
}

/**
 * Detekce směru najetí a odchodu myši pro efekt podtržení
 */
function initDirectionalHover() {
    const navLinks = document.querySelectorAll('.nav-link:not(.lang-switch)');
    
    for (const link of navLinks) {
        // Výchozí směr - použijeme levý
        link.classList.add('direction-left');
        
        // Při najetí myši
        link.addEventListener('mouseenter', (e) => {
            const rect = link.getBoundingClientRect();
            const mouseEnterX = e.clientX;
            
            // Pokud myš přichází zleva, podtržení začíná zleva
            // Pokud myš přichází zprava, podtržení začíná zprava
            if (mouseEnterX < rect.left + rect.width / 2) {
                link.classList.remove('direction-right');
                link.classList.add('direction-left');
            } else {
                link.classList.remove('direction-left');
                link.classList.add('direction-right');
            }
        });
    }
}

/**
 * Detekce směru scrollování pro aktivní položku navigace
 */
function handleScrollDirection() {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollingDown = currentScrollTop > lastScrollTop;
    
    // Pouze pokud se změnil směr scrollování
    if (scrollingDown !== lastScrollDirection) {
        lastScrollDirection = scrollingDown;
        
        // Aktualizace směru podtržení pro aktivní odkazy
        const activeLinks = document.querySelectorAll('.nav-link.active');
        
        for (const link of activeLinks) {
            link.classList.remove('direction-left', 'direction-right');
            link.classList.add(scrollingDown ? 'direction-left' : 'direction-right');
        }
    }
    
    lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
}

/**
 * Inicializace tlačítka pro návrat na začátek stránky
 */
function initScrollToTopButton() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (!scrollToTopBtn) return;
    
    // Zobrazení a skrytí tlačítka podle pozice scrollování
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });
    
    // Akce po kliknutí na tlačítko
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Inicializace glow efektu pro zvýrazněné texty při najetí do jejich blízkosti
 */
function initHighlightGlow() {
    // Najít všechny elementy s třídou highlight
    const highlights = document.querySelectorAll('.highlight');
    
    for (const highlight of highlights) {
        // Zkontrolovat, zda element již není obalen v highlight-container
        if (!highlight.parentElement.classList.contains('highlight-container')) {
            // Vytvořit obalový element s větší aktivní oblastí
            const container = document.createElement('span');
            container.className = 'highlight-container';
            
            // Nahradit highlight element kontejnerem se stejným obsahem
            highlight.parentNode.insertBefore(container, highlight);
            container.appendChild(highlight);
        }
    }
    
    console.log('Highlight glow efekt aktivován při najetí do blízkosti textu');
}

/**
 * Inicializace scrollovacího tlačítka v hero sekci
 */
function initScrollDownButton() {
    const scrollDownBtn = document.querySelector('.scroll-down-btn');
    if (!scrollDownBtn) return;

    scrollDownBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            window.scrollTo({
                top: aboutSection.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
}

/**
 * Inicializace videa v sekci O nás - automatické přehrávání při najetí do viditelné oblasti
 */
function initAboutVideo() {
    const videos = [
        document.getElementById('aboutVideo'),
        document.getElementById('aboutVideoEn'),
        document.getElementById('aboutVideoDe')
    ];
    
    // Pokud není žádné video na stránce, ukončíme funkci
    if (!videos.some(video => video !== null)) return;
    
    // Funkce pro kontrolu, zda je element v zobrazené oblasti
    function isElementInViewport(el) {
        if (!el) return false;
        
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }
    
    // Funkce pro kontrolu a přehrávání/zastavení videa
    function handleVideoVisibility() {
        for (const video of videos) {
            if (!video) continue;
            
            if (isElementInViewport(video)) {
                if (video.paused) {
                    video.play().catch(err => {
                        console.log('Automatické přehrávání videa selhalo:', err);
                    });
                }
            } else {
                if (!video.paused) {
                    video.pause();
                }
            }
        }
    }
    
    // Počáteční kontrola viditelnosti
    handleVideoVisibility();
    
    // Přidání události pro kontrolu při scrollování
    window.addEventListener('scroll', handleVideoVisibility);
    
    // Přidání události pro kontrolu při změně velikosti okna
    window.addEventListener('resize', handleVideoVisibility);
}

// Globální proměnné pro sledování scrollování
let lastScrollTop = 0;
let lastScrollDirection = true; // true = dolů, false = nahoru
