// SCROLL EFFECT NO HEADER
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    header.classList.toggle('scrolled', window.scrollY > 100);
});

// SMOOTH SCROLL PARA ÂNCORAS
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// SCROLL REVEAL ANIMATIONS
const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-scale');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    
    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const revealPoint = 150;
        
        if (elementTop < windowHeight - revealPoint) {
            element.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
revealOnScroll();

// CARROSSEL AUTOMÁTICO MOBILE COM INTERSECTION OBSERVER - VERSÃO MELHORADA
class CarouselManager {
    constructor() {
        this.carousels = new Map();
        this.intervals = new Map();
        this.isMobile = window.innerWidth <= 768;
        
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.initCarousels();
        this.setupIntersectionObserver();
        this.setupNavButtons();
        this.handleResize();
        console.log(`🎠 Carousels iniciados. Mobile: ${this.isMobile}. Total: ${this.carousels.size}`);
    }

    initCarousels() {
        // Buscar todos os carousels (.carousel-container e .testimonials-container)
        document.querySelectorAll('.carousel-container, .testimonials-container').forEach(container => {
            const id = container.id;
            if (id) {
                this.carousels.set(id, {
                    element: container,
                    isVisible: false,
                    currentIndex: 0,
                    type: container.classList.contains('testimonials-container') ? 'testimonials' : 'carousel'
                });
            }
        });
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Encontrar o carousel correspondente
                let carousel = null;
                for (let [id, c] of this.carousels) {
                    if (c.element === entry.target) {
                        carousel = c;
                        break;
                    }
                }

                if (carousel) {
                    carousel.isVisible = entry.isIntersecting;
                    
                    if (entry.isIntersecting && this.isMobile) {
                        this.startAutoScroll(carousel);
                    } else {
                        this.stopAutoScroll(carousel);
                    }
                }
            });
        }, { threshold: 0.3 });

        this.carousels.forEach(carousel => {
            observer.observe(carousel.element);
        });
    }

    startAutoScroll(carousel) {
        const carouselId = Array.from(this.carousels.entries()).find(([_, c]) => c === carousel)?.[0];
        
        if (!carouselId || this.intervals.has(carouselId)) return;

        console.log(`⏱️ Auto-scroll iniciado: ${carouselId}`);

        const interval = setInterval(() => {
            if (carousel.isVisible) {
                this.scrollNext(carousel);
            }
        }, 6000);

        this.intervals.set(carouselId, interval);
    }

    stopAutoScroll(carousel) {
        const carouselId = Array.from(this.carousels.entries()).find(([_, c]) => c === carousel)?.[0];
        
        if (carouselId && this.intervals.has(carouselId)) {
            console.log(`⏸️ Auto-scroll parado: ${carouselId}`);
            clearInterval(this.intervals.get(carouselId));
            this.intervals.delete(carouselId);
        }
    }

    scrollNext(carousel) {
        const cards = carousel.element.querySelectorAll('[scroll-snap-align]');
        if (cards.length === 0) return;

        const gap = parseInt(window.getComputedStyle(carousel.element).gap) || 0;
        const cardWidth = cards[0].offsetWidth + gap;
        const currentScroll = carousel.element.scrollLeft;
        const nextScroll = currentScroll + cardWidth;
        const maxScroll = carousel.element.scrollWidth - carousel.element.clientWidth;

        if (nextScroll >= maxScroll - 10) {
            carousel.element.scrollTo({ left: 0, behavior: 'smooth' });
            carousel.currentIndex = 0;
        } else {
            carousel.element.scrollBy({ left: cardWidth, behavior: 'smooth' });
            carousel.currentIndex++;
        }
    }

    scrollPrev(carousel) {
        const cards = carousel.element.querySelectorAll('[scroll-snap-align]');
        if (cards.length === 0) return;

        const gap = parseInt(window.getComputedStyle(carousel.element).gap) || 0;
        const cardWidth = cards[0].offsetWidth + gap;
        const currentScroll = carousel.element.scrollLeft;
        const prevScroll = currentScroll - cardWidth;

        if (prevScroll <= 0) {
            const maxScroll = carousel.element.scrollWidth - carousel.element.clientWidth;
            carousel.element.scrollTo({ left: maxScroll, behavior: 'smooth' });
            carousel.currentIndex = Math.ceil((maxScroll + cardWidth) / cardWidth) - 1;
        } else {
            carousel.element.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            carousel.currentIndex--;
        }
    }

    setupNavButtons() {
        document.querySelectorAll('.carousel-nav').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const carouselId = btn.dataset.carousel;
                const carousel = this.carousels.get(carouselId);
                
                if (carousel) {
                    if (btn.classList.contains('carousel-prev')) {
                        this.scrollPrev(carousel);
                    } else {
                        this.scrollNext(carousel);
                    }
                    // Reiniciar o intervalo ao clicar
                    this.stopAutoScroll(carousel);
                    if (carousel.isVisible && this.isMobile) {
                        this.startAutoScroll(carousel);
                    }
                }
            });
        });
    }

    handleResize() {
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;

            if (wasMobile !== this.isMobile) {
                console.log(`📱 Resize detectado. Mobile: ${this.isMobile}`);
                this.carousels.forEach((carousel, id) => {
                    if (this.isMobile && carousel.isVisible) {
                        this.startAutoScroll(carousel);
                    } else {
                        this.stopAutoScroll(carousel);
                    }
                });
            }
        });
    }
}

// INICIALIZAR CARROSSEL
const carouselManager = new CarouselManager();

// FAQ ACCORDION
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        const isActive = answer.classList.contains('active');
        
        document.querySelectorAll('.faq-answer').forEach(a => {
            if (a !== answer) {
                a.classList.remove('active');
                a.previousElementSibling.classList.remove('active');
            }
        });
        
        answer.classList.toggle('active', !isActive);
        button.classList.toggle('active', !isActive);
    });
});

// FORM SUBMISSION
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const message = `CONSULTORIA JURÍDICA - Silva & Associados\n\nNome: ${formData.get('nome')}\nEmail: ${formData.get('email')}\nTelefone: ${formData.get('telefone')}\nÁrea de Interesse: ${formData.get('interesse')}\n\nMensagem:\n${formData.get('mensagem')}`;
    
    const whatsappURL = `https://wa.me/551133334444?text=${encodeURIComponent(message)}`;
    
    const btn = this.querySelector('.submit-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    
    setTimeout(() => {
        window.open(whatsappURL, '_blank');
        this.reset();
        btn.innerHTML = originalHTML;
    }, 1500);
});

// FORMATAR TELEFONE
document.getElementById('telefone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 11) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    e.target.value = value;
});

// FECHA MENU AO CLICAR EM LINK
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        navLinks.style.display = 'none';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// MOBILE MENU TOGGLE
document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    const navLinks = document.querySelector('.nav-links');
    const isVisible = navLinks.style.display === 'flex';
    
    if (isVisible) {
        navLinks.style.display = 'none';
        this.innerHTML = '<i class="fas fa-bars"></i>';
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'rgba(26, 21, 16, 0.98)';
        navLinks.style.padding = '2rem';
        navLinks.style.zIndex = '999';
        navLinks.style.gap = '1rem';
        this.innerHTML = '<i class="fas fa-times"></i>';
    }
});