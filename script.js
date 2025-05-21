// --- "Guía de Evaluación en EI (LOMLOE)" - Script Principal ---

// Variables globales para elementos de audio.
let sonidoExito;
let sonidoClick;
let sonidoHover;

// Variable para almacenar el elemento que tenía el foco antes de abrir un modal.
let lastFocusedElement;

// --- INICIALIZACIÓN GENERAL ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Guía de Evaluación en EI (LOMLOE): Documento cargado y scripts listos.");

    // Inicializar elementos de audio
    try {
        sonidoExito = document.getElementById('sonidoExito');
        sonidoClick = document.getElementById('sonidoClick');
        sonidoHover = document.getElementById('sonidoHover');
        [sonidoExito, sonidoClick, sonidoHover].forEach(sound => {
            if (sound) sound.load(); // Pre-cargar audios
        });
    } catch (e) {
        console.error("Error inicializando elementos de audio:", e);
    }

    // Configurar funcionalidades de la página
    setupMenuHamburguesa();
    setupSmoothScrolling();
    setupModales();
    setupAcordeones();
    setupTabs();
    setupSonidosUI();
    setupScrollAnimations();
    setActiveLinkScroll();

    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
});

// --- FUNCIONES DE CONFIGURACIÓN (SETUP) ---

function setupMenuHamburguesa() {
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const mainNavList = document.getElementById('main-nav-list');

    if (!menuToggle || !mainNav || !mainNavList) {
        console.warn("Elementos del menú hamburguesa no encontrados.");
        return;
    }

    menuToggle.addEventListener('click', () => {
        const isActive = mainNav.classList.toggle('is-active');
        menuToggle.setAttribute('aria-expanded', isActive.toString());
        mainNav.setAttribute('aria-hidden', (!isActive).toString());
        
        const icon = menuToggle.querySelector('i');
        icon.classList.toggle('fa-bars', !isActive);
        icon.classList.toggle('fa-times', isActive);
        menuToggle.setAttribute('aria-label', isActive ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');

        playSound(sonidoClick);
    });

    mainNavList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('is-active')) {
                mainNav.classList.remove('is-active');
                menuToggle.setAttribute('aria-expanded', 'false');
                mainNav.setAttribute('aria-hidden', 'true');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
            }
        });
    });
}

function setupSmoothScrolling() {
    document.querySelectorAll('#main-nav-list a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            playSound(sonidoClick);
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const header = document.querySelector('header');
                const headerOffset = header ? header.offsetHeight : 70;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset - 10; 

                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
        });
    });
}

function setupModales() {
    const modalTriggers = document.querySelectorAll('.modal-trigger');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modalId = this.dataset.modalTarget;
            const modal = document.getElementById(modalId);
            if (modal) {
                openModal(modal, this);
            } else {
                console.error(`Modal con ID "${modalId}" no encontrado.`);
            }
        });
    });

    document.querySelectorAll('.modal .close-button').forEach(button => {
        button.addEventListener('click', function() {
            closeModal(this.closest('.modal'));
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                closeModal(this);
            }
        });
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const visibleModal = document.querySelector('.modal.is-visible');
            if (visibleModal) {
                closeModal(visibleModal);
            }
        }
    });
}

function setupAcordeones() {
    document.querySelectorAll(".accordion-header").forEach(header => {
        const content = header.nextElementSibling;
        if (!content || !content.classList.contains('accordion-content')) {
            console.warn("Contenido de acordeón no encontrado para:", header.textContent.trim());
            return;
        }

        const headerId = header.id || `accordion-header-${Math.random().toString(36).substring(2, 9)}`;
        const contentId = content.id || `accordion-content-${Math.random().toString(36).substring(2, 9)}`;
        header.id = headerId;
        content.id = contentId;
        header.setAttribute('aria-controls', contentId);
        content.setAttribute('aria-labelledby', headerId);

        const isActiveInitial = header.classList.contains('active');
        header.setAttribute('aria-expanded', isActiveInitial.toString());
        content.setAttribute('aria-hidden', (!isActiveInitial).toString());
        if(isActiveInitial) {
            content.classList.add('active');
            const paddingTop = parseFloat(getComputedStyle(content).paddingTop) || 0;
            const paddingBottom = parseFloat(getComputedStyle(content).paddingBottom) || 0;
            content.style.maxHeight = (content.scrollHeight + paddingTop + paddingBottom) + "px";
        }

        header.addEventListener("click", function() {
            playSound(sonidoClick);
            const item = this.parentElement;
            const isActive = item.classList.toggle('active');

            this.setAttribute('aria-expanded', isActive.toString());
            this.classList.toggle('active', isActive);
            content.setAttribute('aria-hidden', (!isActive).toString());
            content.classList.toggle('active', isActive);

            if (isActive) {
                const parentContainer = this.closest('.accordion-container');
                if (parentContainer) {
                    parentContainer.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                        if (activeItem !== item) {
                            activeItem.classList.remove('active');
                            const activeHeader = activeItem.querySelector('.accordion-header');
                            const activeContent = activeItem.querySelector('.accordion-content');
                            if (activeHeader) {
                                activeHeader.classList.remove('active');
                                activeHeader.setAttribute('aria-expanded', 'false');
                            }
                            if (activeContent) {
                                activeContent.classList.remove('active');
                                activeContent.setAttribute('aria-hidden', 'true');
                                activeContent.style.maxHeight = null;
                            }
                        }
                    });
                }
                const paddingTop = parseFloat(getComputedStyle(content).paddingTop) || 0;
                const paddingBottom = parseFloat(getComputedStyle(content).paddingBottom) || 0;
                content.style.maxHeight = (content.scrollHeight + paddingTop + paddingBottom) + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
        header.addEventListener("mouseenter", () => playSound(sonidoHover, 0.1));
    });
}

function setupTabs() {
    const tabContainers = document.querySelectorAll('.tabs-container');
    tabContainers.forEach(container => {
        const tabButtons = container.querySelectorAll('.tab-button');
        const tabContentArea = container.querySelector('.tab-content-area');
        if (!tabContentArea) {
            console.warn("Área de contenido de pestañas no encontrada en:", container);
            return;
        }
        // El contenido de los tabs son los hijos directos de tabContentArea con role="tabpanel"
        const tabContents = Array.from(tabContentArea.children).filter(el => el.matches('[role="tabpanel"]'));

        tabButtons.forEach(button => {
            const targetContentId = button.getAttribute('aria-controls');
            const targetContent = document.getElementById(targetContentId);

            if (button.classList.contains('active')) {
                button.setAttribute('aria-selected', 'true');
                button.tabIndex = 0;
                if (targetContent) targetContent.hidden = false;
            } else {
                button.setAttribute('aria-selected', 'false');
                button.tabIndex = -1;
                if (targetContent) targetContent.hidden = true;
            }

            button.addEventListener('click', () => {
                playSound(sonidoClick);
                tabButtons.forEach(btn => { // Solo los botones dentro del mismo contenedor
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                    btn.tabIndex = -1;
                });
                tabContents.forEach(content => { // Solo el contenido dentro del mismo contenedor
                    content.hidden = true;
                });

                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
                button.tabIndex = 0;
                if (targetContent) {
                    targetContent.hidden = false;
                }
            });
        });
    });
}

function setupSonidosUI() {
    document.querySelectorAll('.action-button, .action-button-inline, .card.modal-trigger, .tab-button, .accordion-header').forEach(element => {
        element.addEventListener("mouseenter", () => playSound(sonidoHover, 0.1));
    });
}

function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .anim-pop-in');
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible-anim');
                // observer.unobserve(entry.target); // Descomentar para animar solo una vez
            } else {
                // entry.target.classList.remove('is-visible-anim'); // Descomentar para animar cada vez
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => observer.observe(el));
}

function setActiveLinkScroll() {
    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll("#main-nav-list a");

    if (sections.length === 0 || navLinks.length === 0) return;
    const headerHeight = document.querySelector('header')?.offsetHeight || 70;

    const observerCallback = (entries) => {
        let intersectingSectionId = null;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (intersectingSectionId === null || entry.target.offsetTop < document.getElementById(intersectingSectionId).offsetTop) {
                    intersectingSectionId = entry.target.id;
                }
            }
        });
        
        if (window.pageYOffset < (sections[0].offsetTop - headerHeight - 20) && sections.length > 0 && sections[0].id) {
             intersectingSectionId = sections[0].id;
        }

        navLinks.forEach((link) => {
            link.classList.remove("active-link");
            if (intersectingSectionId && link.getAttribute("href") === `#${intersectingSectionId}`) {
                link.classList.add("active-link");
            }
        });
    };
    
    const rootMarginBottom = -(window.innerHeight - headerHeight - Math.min(100, window.innerHeight * 0.15));
    const observerOptions = {
        rootMargin: `-${headerHeight}px 0px ${rootMarginBottom}px 0px`,
        threshold: 0
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));
}

// --- FUNCIONES DE UTILIDAD ---

function openModal(modal, triggerElement) {
    if (!modal) {
        console.error("Intento de abrir un modal nulo.");
        return;
    }
    lastFocusedElement = triggerElement || document.activeElement;

    modal.style.display = "flex";
    void modal.offsetWidth; // Forzar reflujo

    modal.classList.remove('is-hiding');
    modal.classList.add('is-visible');
    modal.setAttribute('aria-hidden', 'false');

    const focusableElements = 'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
    let firstFocusableElement = modal.querySelector('[autofocus]');
    if (!firstFocusableElement) {
        firstFocusableElement = modal.querySelector(focusableElements);
    }
    if (firstFocusableElement) {
        firstFocusableElement.focus();
    } else {
        modal.setAttribute('tabindex', '-1');
        modal.focus();
    }
    
    trapFocus(modal);
    document.body.style.overflow = 'hidden';
    playSound(sonidoClick);
}

function closeModal(modal) {
    if (!modal || !modal.classList.contains('is-visible')) return;

    modal.classList.add('is-hiding');
    modal.classList.remove('is-visible');
    modal.setAttribute('aria-hidden', 'true');
    
    if (modal._trapFocusHandler) { // Limpiar el handler de trapFocus
        modal.removeEventListener('keydown', modal._trapFocusHandler);
        delete modal._trapFocusHandler;
    }

    document.body.style.overflow = '';
    playSound(sonidoClick);

    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }

    const animationDuration = parseFloat(getComputedStyle(modal).animationDuration) * 1000 || 300;

    modal.addEventListener('animationend', function handler(event) {
        if (event.animationName === 'fadeOutModal' && modal.classList.contains('is-hiding')) {
            modal.style.display = "none";
            modal.classList.remove('is-hiding');
            if (modal.getAttribute('tabindex') === '-1') {
                 modal.removeAttribute('tabindex');
            }
            modal.removeEventListener('animationend', handler);
        }
    }, { once: true });

    setTimeout(() => {
        if (modal.classList.contains('is-hiding')) {
            modal.style.display = "none";
            modal.classList.remove('is-hiding');
            if (modal.getAttribute('tabindex') === '-1') {
                 modal.removeAttribute('tabindex');
            }
        }
    }, animationDuration + 100);
}

function trapFocus(element) {
    const focusableElementsString = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    let focusableElements = Array.from(element.querySelectorAll(focusableElementsString));
    focusableElements = focusableElements.filter(el => el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none');

    if (focusableElements.length === 0) return;

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    const trapFocusHandler = function(e) {
        const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
        if (!isTabPressed) return;

        if (e.shiftKey) { 
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else { 
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    };
    
    element._trapFocusHandler = trapFocusHandler; 
    element.addEventListener('keydown', element._trapFocusHandler);
}

function playSound(audioElement, volume = 0.15) {
  if (audioElement && typeof audioElement.play === 'function') {
    try {
        audioElement.pause();
        audioElement.currentTime = 0;
        audioElement.volume = volume;
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                if (error.name !== 'NotAllowedError' && error.name !== 'NotSupportedError') {
                    // console.warn("Error al reproducir sonido:", error.name, error.message, "ID:", audioElement.id);
                }
            });
        }
    } catch (error) {
         // console.error("Error inesperado procesando audio:", error, "ID:", audioElement.id);
    }
  }
}