// ===== Navigation / Header =====
const header = document.querySelector('header');
const nav = document.querySelector('[data-nav]');
const navMenu = document.getElementById('nav-links');
const hamburger = document.getElementById('hamburger');
const navLinks = () => Array.from(document.querySelectorAll('#nav-links a[href^="#"]'));
const dropdowns = () => Array.from(document.querySelectorAll('[data-dropdown]'));

const isMobileNav = () => window.innerWidth <= 900;

function setMenuState(isOpen) {
  if (!nav || !navMenu || !hamburger) return;
  nav.classList.toggle('open', isOpen);
  navMenu.classList.toggle('open', isOpen);
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
}

function initHamburgerMenu() {
  if (!nav || !navMenu || !hamburger) return;
  setMenuState(false);

  hamburger.addEventListener('click', () => {
    const willOpen = !nav.classList.contains('open');
    setMenuState(willOpen);
  });

  navMenu.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('a')) {
      setMenuState(false);
    }
  });
}

function initDropdowns() {
  dropdowns().forEach((dropdown) => {
    const toggle = dropdown.querySelector('[data-dropdown-toggle]');
    if (!toggle) return;

    toggle.addEventListener('click', (event) => {
      if (!isMobileNav()) return;
      event.preventDefault();
      event.stopPropagation();
      const isOpen = dropdown.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    dropdown.addEventListener('mouseenter', () => {
      if (!isMobileNav()) toggle.setAttribute('aria-expanded', 'true');
    });

    dropdown.addEventListener('mouseleave', () => {
      if (!isMobileNav()) toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (event) => {
    dropdowns().forEach((dropdown) => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove('open');
        const toggle = dropdown.querySelector('[data-dropdown-toggle]');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

function updateHeaderState() {
  if (!header) return;
  const shouldBeScrolled = window.scrollY > 20;
  header.classList.toggle('scrolled', shouldBeScrolled);
}

function updateActiveNavLink() {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const checkpoint = window.innerHeight * 0.3;
  let activeId = '';

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= checkpoint && rect.bottom >= checkpoint) {
      activeId = section.id;
    }
  });

  navLinks().forEach((link) => {
    const href = link.getAttribute('href') || '';
    const targetId = href.startsWith('#') ? href.slice(1) : '';
    link.classList.toggle('active', targetId === activeId);
  });
}

function closeMenuOnResize() {
  if (!isMobileNav()) {
    setMenuState(false);
  }
}

// ===== Carousel =====
function initCarousel() {
  const carousel = document.querySelector('[data-carousel]');
  const prevBtn = document.querySelector('[data-carousel-prev]');
  const nextBtn = document.querySelector('[data-carousel-next]');
  const dotsContainer = document.querySelector('[data-carousel-dots]');
  const wrapper = document.querySelector('.snacks-carousel-wrapper');

  if (!carousel || !dotsContainer || !wrapper) {
    return () => {};
  }

  const cards = Array.from(carousel.children);
  if (!cards.length) return () => {};

  let currentSlide = 0;
  let fullCardWidth = 0;
  let visibleCount = 1;

  const computeMetrics = () => {
    const gap = parseFloat(getComputedStyle(carousel).gap || '0');
    const firstCard = cards[0];
    if (!firstCard) return;
    fullCardWidth = firstCard.getBoundingClientRect().width + gap;

    const buttonsWidth = (prevBtn?.offsetWidth || 0) + (nextBtn?.offsetWidth || 0);
    const availableWidth = wrapper.clientWidth - buttonsWidth;
    visibleCount = Math.max(1, Math.floor(availableWidth / fullCardWidth));
  };

  const createDots = () => {
    dotsContainer.innerHTML = '';
    cards.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Ir para o item ${index + 1}`);
      dot.addEventListener('click', () => {
        currentSlide = index;
        updateCarousel();
      });
      dotsContainer.appendChild(dot);
    });
  };

  const updateDots = () => {
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  };

  const updateButtons = (maxSlide) => {
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide >= maxSlide;
  };

  const updateCarousel = () => {
    computeMetrics();
    const isMobile = window.matchMedia('(max-width: 700px)').matches;
    const maxSlide = Math.max(0, cards.length - visibleCount);
    currentSlide = Math.min(currentSlide, maxSlide);

    if (isMobile) {
      carousel.style.transform = '';
      currentSlide = 0;
    } else {
      const offset = currentSlide * fullCardWidth;
      carousel.style.transform = `translateX(-${offset}px)`;
    }

    updateDots();
    updateButtons(maxSlide);
  };

  createDots();
  updateCarousel();

  prevBtn?.addEventListener('click', () => {
    currentSlide = Math.max(0, currentSlide - 1);
    updateCarousel();
  });

  nextBtn?.addEventListener('click', () => {
    const maxSlide = Math.max(0, cards.length - visibleCount);
    currentSlide = Math.min(maxSlide, currentSlide + 1);
    updateCarousel();
  });

  return updateCarousel;
}

// ===== Scroll Reveal =====
let revealElements = [];
let revealObserver;

function revealOnScroll() {
  revealElements.forEach((element) => {
    if (element.classList.contains('visible')) return;
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      element.classList.add('visible');
    }
  });
}

function initReveal() {
  revealElements = Array.from(document.querySelectorAll('.reveal'));

  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight - 60) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealOnScroll();
  }
}

// ===== Contact Form =====
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  if (!form || !statusEl) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const defaultButtonText = submitBtn?.textContent || 'Enviar';

  const setStatus = (message, type) => {
    statusEl.textContent = message;
    statusEl.classList.remove('error', 'success');
    if (type) statusEl.classList.add(type);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const nome = form.nome?.value.trim();
    const email = form.email?.value.trim();
    const mensagem = form.mensagem?.value.trim();

    if (!nome || !email || !mensagem) {
      setStatus('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    if (!emailRegex.test(email)) {
      setStatus('Digite um e-mail válido.', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
    }
    setStatus('Enviando sua mensagem...', null);

    setTimeout(() => {
      form.reset();
      setStatus('✓ Mensagem enviada com sucesso!', 'success');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = defaultButtonText;
      }
    }, 1200);
  });
}

// ===== Image Fallbacks =====
function initSnackImageFallbacks() {
  const fallbackSrc = 'https://via.placeholder.com/320x220?text=Imagem';
  const images = document.querySelectorAll('.product-image img');

  images.forEach((img) => {
    img.addEventListener('error', () => {
      if (img.src !== fallbackSrc) {
        img.src = fallbackSrc;
      }
    });
  });
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  initHamburgerMenu();
  initDropdowns();

  const updateCarousel = initCarousel();
  initSnackImageFallbacks();
  initReveal();
  revealOnScroll();
  updateActiveNavLink();
  updateHeaderState();
  initContactForm();

  window.addEventListener('resize', () => {
    closeMenuOnResize();
    updateCarousel();
  });
});

window.addEventListener('scroll', () => {
  updateHeaderState();
  updateActiveNavLink();
  revealOnScroll();
});
