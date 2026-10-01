/* ============================================================
   ARTAFIC â€” Main JavaScript
   Version: 1.0.0
   ============================================================ */

'use strict';

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   UTILITIES
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   01. NAVIGATION â€” Scroll-aware sticky nav
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initNav() {
  const nav = $('#nav');
  if (!nav) return;

  const darkSelector = [
    '#home',
    '#marquee',
    '#value-strip',
    '#before-after',
    '#less-noise',
    '.less-noise',
    '#about',
    '#about-hero',
    '#why-exists',
    '.why-exists',
    '#privacy-hero',
    '#privacy-use',
    '#privacy-cta',
    '#terms-hero',
    '#terms-engagements',
    '#terms-cta',
    '#faq-hero',
    '#about-cta',
    'footer',
    '.footer',
    '.about-me-section',
    '[data-nav-theme="dark"]'
  ].join(', ');

  function updateNavState() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollY > 20) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }

    // Check if navbar center overlaps any dark section
    const navBounds = nav.getBoundingClientRect();
    const navCenterY = navBounds.top + navBounds.height / 2;
    
    const darkSections = document.querySelectorAll(darkSelector);
    let isOverDark = false;
    for (const sec of darkSections) {
      const rect = sec.getBoundingClientRect();
      if (rect.height > 0 && navCenterY >= rect.top && navCenterY <= rect.bottom) {
        isOverDark = true;
        break;
      }
    }

    if (isOverDark) {
      nav.classList.add('nav--on-dark');
    } else {
      nav.classList.remove('nav--on-dark');
    }
  }

  window.updateNavState = updateNavState;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateNavState();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateNavState, { passive: true });
  document.addEventListener('DOMContentLoaded', updateNavState);
  updateNavState();
})();


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   02. MOBILE MENU
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initMobileMenu() {
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    hamburger.classList.add('is-open');
    mobileMenu.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isOpen = false;
    hamburger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  const closeBtn = $('#mobile-menu-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  hamburger.addEventListener('click', () => {
    isOpen ? closeMenu() : openMenu();
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
      closeMenu();
    }
  });
  window.closeMobileMenu = closeMenu;
})();


/* ────────────────────────────────────────────────────────────
   03. SMOOTH ANCHOR SCROLLING (Delegated to Unified Nav Engine)
   ──────────────────────────────────────────────────────────── */
// Handled globally and reliably by the unified navigation system in Section 20


/* ────────────────────────────────────────────────────────────
   04. SCROLL REVEAL (IntersectionObserver)
   ──────────────────────────────────────────────────────────── */
window.initScrollReveal = function() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealTargets = document.querySelectorAll('[data-reveal], .fade-up, .reveal-text-inner');
  if (revealTargets.length === 0) return;

  if (prefersReducedMotion) {
    revealTargets.forEach(el => {
      el.classList.add('is-visible', 'is-revealed');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible', 'is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  revealTargets.forEach(el => observer.observe(el));
};
window.initScrollReveal();


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/* ────────────────────────────────────────────────────────────
   05. BEFORE / AFTER SLIDER — HIGH PERFORMANCE TOUCH TRACKING
   ──────────────────────────────────────────────────────────── */
window.initSlider = function() {
  const container = $('#slider-container');
  if (!container) return;

  const before = $('#slider-before');
  const divider = $('#slider-divider');
  const handle = $('#slider-handle');
  if (!before || !divider || !handle) return;

  let isDragging = false;
  let currentPercent = 50;
  let cachedRect = null;
  let rAFId = null;

  function updateBounds() {
    cachedRect = container.getBoundingClientRect();
  }

  function renderPosition(percent) {
    currentPercent = clamp(percent, 0, 100);
    const pct = currentPercent + '%';
    before.style.clipPath = `inset(0 ${100 - currentPercent}% 0 0)`;
    divider.style.left = pct;
    handle.style.left = pct;
  }

  function updatePositionFromClientX(clientX) {
    if (!cachedRect) updateBounds();
    const percent = ((clientX - cachedRect.left) / cachedRect.width) * 100;
    renderPosition(percent);
  }

  function onPointerDown(e) {
    isDragging = true;
    updateBounds();
    handle.classList.add('is-dragging');
    if (e.pointerId !== undefined && container.setPointerCapture) {
      try { container.setPointerCapture(e.pointerId); } catch(err) {}
    }
    updatePositionFromClientX(e.clientX);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const clientX = e.clientX;
    if (rAFId) cancelAnimationFrame(rAFId);
    rAFId = requestAnimationFrame(() => {
      updatePositionFromClientX(clientX);
    });
  }

  function onPointerUp(e) {
    isDragging = false;
    handle.classList.remove('is-dragging');
    if (e && e.pointerId !== undefined && container.releasePointerCapture) {
      try { container.releasePointerCapture(e.pointerId); } catch(err) {}
    }
  }

  // Touch dragging support for mobile
  function onTouchMove(e) {
    if (e.touches && e.touches[0]) {
      updatePositionFromClientX(e.touches[0].clientX);
    }
  }
  container.addEventListener('touchmove', onTouchMove, { passive: true });
  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove, { passive: true });
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerUp);

  window.addEventListener('resize', updateBounds, { passive: true });

  // Keyboard accessibility
  container.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      renderPosition(currentPercent - step);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      renderPosition(currentPercent + step);
    }
  });

  // Init at 50%
  renderPosition(50);
};
window.initSlider();


/* ────────────────────────────────────────────────────────────
   06. FAQ ACCORDION — CONTENT-AWARE ACCORDION EXPANSION
   ──────────────────────────────────────────────────────────── */
window.initAccordion = function() {
  const accordion = $('#faq-accordion');
  if (!accordion) return;

  const items = $$('.faq-item', accordion);

  items.forEach(item => {
    const trigger = item.querySelector('.faq-item__trigger');
    const body = item.querySelector('.faq-item__body');
    if (!trigger || !body) return;

    // Clone to clear old listeners if re-initialized
    const newTrigger = trigger.cloneNode(true);
    trigger.parentNode.replaceChild(newTrigger, trigger);

    newTrigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all others
      items.forEach(i => {
        if (i !== item) {
          i.classList.remove('is-open');
          const otherTrigger = i.querySelector('.faq-item__trigger');
          const otherBody = i.querySelector('.faq-item__body');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          if (otherBody) otherBody.style.maxHeight = '0px';
        }
      });

      // Toggle current
      item.classList.toggle('is-open', !isOpen);
      newTrigger.setAttribute('aria-expanded', String(!isOpen));

      if (!isOpen) {
        body.style.maxHeight = body.scrollHeight + 'px';
      } else {
        body.style.maxHeight = '0px';
      }
    });

    // Keyboard support
    newTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        newTrigger.click();
      }
    });
  });
};
window.initAccordion();


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   07. BOOKING FORM VALIDATION
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initBookingForm() {
  const form = $('#booking-form');
  const successEl = $('#booking-success');
  if (!form) return;

  const ALLOWED_SERVICES = ['web-development', 'logo-design', 'both', 'not-sure'];
  const SERVICE_NAMES = {
    'web-development': 'Web Development',
    'logo-design': 'Logo Design',
    'both': 'Web Development & Logo Design',
    'not-sure': 'General Inquiry'
  };

  const fields = [
    { id: 'field-name',    errorId: 'error-name',    validate: v => v.trim().length >= 2 && v.trim().length <= 100 },
    { id: 'field-email',   errorId: 'error-email',   validate: v => v.trim().length <= 100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    { id: 'field-service', errorId: 'error-service', validate: v => ALLOWED_SERVICES.includes(v) }
  ];

  function setError(fieldId, errorId, hasError) {
    const field = $(`#${fieldId}`);
    const error = $(`#${errorId}`);
    if (!field || !error) return;

    if (hasError) {
      field.classList.add('has-error');
      error.classList.add('is-visible');
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', errorId);
    } else {
      field.classList.remove('has-error');
      error.classList.remove('is-visible');
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
  }

  // Live validation on blur
  fields.forEach(({ id, errorId, validate }) => {
    const el = $(`#${id}`);
    if (!el) return;

    el.addEventListener('blur', () => {
      const isValid = validate(el.value);
      setError(id, errorId, !isValid);
    });

    el.addEventListener('input', () => {
      if (el.classList.contains('has-error')) {
        const isValid = validate(el.value);
        setError(id, errorId, !isValid);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let firstError = null;
    let allValid = true;

    fields.forEach(({ id, errorId, validate }) => {
      const el = $(`#${id}`);
      if (!el) return;
      const isValid = validate(el.value);
      setError(id, errorId, !isValid);
      if (!isValid && !firstError) {
        firstError = el;
        allValid = false;
      }
    });

    if (!allValid) {
      firstError.focus();
      return;
    }

    // Input Sanitization (XSS Defense)
    function sanitize(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }

    const sanitizedData = {
      name: sanitize($('#field-name').value),
      email: sanitize($('#field-email').value),
      service: sanitize($('#field-service').value),
      description: $('#field-description') ? sanitize($('#field-description').value) : ''
    };

        // Success & Honest Dispatch with Email Header Injection Protection
    const cleanName = $('#field-name').value.trim().replace(/[\r\n\x00-\x1f]+/g, ' ').slice(0, 100);
    const cleanEmail = $('#field-email').value.trim().replace(/[\r\n\x00-\x1f]+/g, '').slice(0, 100);
    const rawService = $('#field-service').value;
    const cleanService = SERVICE_NAMES[rawService] || 'Project Inquiry';
    const cleanDesc = ($('#field-description') ? $('#field-description').value.trim() : '').slice(0, 2000);

    const subject = encodeURIComponent(`Project Inquiry: ${cleanService} - ${cleanName}`);
    const body = encodeURIComponent(
      `Name: ${cleanName}\nEmail: ${cleanEmail}\nService: ${cleanService}\n\nProject Details:\n${cleanDesc}\n\n---\nSent via artafic.com inquiry form`
    );

    const submitBtn = $('#form-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Preparing Message…';

    // Trigger direct mail client with pre-filled inquiry details
    window.location.href = `mailto:hello@artafic.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
      form.style.display = 'none';
      successEl.classList.add('is-visible');
      successEl.focus();
    }, 300);
  });
})();


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   08. CHATBOT
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initChatbot() {
  const launcherBtn = $('#chatbot-launcher-btn');
  const panel = $('#chatbot-panel');
  const closeBtn = $('#chatbot-close');
  const messagesEl = $('#chatbot-messages');
  const suggestionsEl = $('#chatbot-suggestions');
  const input = $('#chatbot-input');
  const sendBtn = $('#chatbot-send');
  const badge = launcherBtn ? launcherBtn.querySelector('.chatbot-launcher__badge') : null;

  if (!launcherBtn || !panel) return;

  let isOpen = false;
  let greetingShown = false;

  // â”€â”€â”€ FAQ Knowledge Base â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const faqAnswers = {
    services: {
      text: 'ARTAFIC offers two focused services:\n\n**Web Development** â€” Professional, responsive websites built around your business goals, customer behavior, and conversion.\n\n**Logo Building** â€” Custom logo design that gives your business a cleaner, more professional visual identity.\n\nWe deliberately keep our focus narrow to ensure quality in both areas.',
      cta: true
    },
        process: {
      text: 'Our process has four stages:\n\n**01 — Understand:** We learn about your business, audience, and goals.\n\n**02 — Design:** We create a clear visual and UX direction aligned to those goals.\n\n**03 — Build:** We develop the responsive website from the approved design.\n\n**04 — Refine:** We test, review, and polish before delivery.\n\nEach stage includes your review and approval.',
      cta: true
    },
    cost: {
      text: 'Project pricing is based on scope, requirements, complexity, and your business goals. We don\'t publish fixed packages because no two projects are the same.\n\nThe right approach is a conversation â€” get in touch and we can discuss your project and provide a proper estimate.',
      cta: true
    },
    timeline: {
      text: 'Timeline depends on the scope and complexity of your project. Every project is different.\n\nThe most accurate way to get a timeline is to get in touch so we can understand your specific requirements and give you a realistic estimate based on what the work actually involves.',
      cta: true
    },
    redesign: {
      text: 'Yes. Redesigning an existing website is one of the most common types of projects we work on.\n\nIf your current site is outdated, underperforming, or no longer reflects your business properly, we can redesign it from the ground up â€” keeping what works and replacing what doesn\'t.',
      cta: true
    },
    booking: {
      text: 'Getting in touch is simple â€” scroll down to the "Get In Touch" section on this page, or click the "Get In Touch" button in the navigation.\n\nFill in the simple form with your details and we\'ll review your inquiry and reach out promptly.',
      cta: true
    }
  };

  // Helper for randomized responses
  function getRandomResponse(responsesArray) {
    return responsesArray[Math.floor(Math.random() * responsesArray.length)];
  }

  // Answer matching logic for ARTAFIC Assistant
  function getFallbackAnswer(message) {
    const rawText = message.trim();
    const lower = rawText.toLowerCase().replace(/[?!.,;]/g, '');

    // 1. Casual conversational elements (Greetings & Closures)
    if (/^(hi|hello|hey|greetings|sup)\b/.test(lower) || lower.includes('good morning') || lower.includes('good afternoon')) {
      return { 
        text: getRandomResponse([
          "Hi there! I'm ARTAFIC Assistant. How can I help you learn about our services?",
          "Hello! I'm ARTAFIC Assistant. What can I help you with today?",
          "Hey! I'm the digital assistant for ARTAFIC. Let me know if you have any questions."
        ]), 
        cta: false 
      };
    }
    
    if (lower === 'assalamualaikum' || lower === 'salam') {
      return {
        text: getRandomResponse([
          "Walaikum Assalam! I'm ARTAFIC Assistant. How can I help you today?",
          "Walaikum Assalam! I'm the digital assistant for ARTAFIC. What can I do for you?"
        ]),
        cta: false
      };
    }

    if (lower === 'thanks' || lower === 'thank you' || lower === 'thx') {
      return { 
        text: getRandomResponse([
          "You're welcome! Let me know if you need anything else.",
          "Happy to help! Have a great day.",
          "Anytime! Feel free to ask if you have more questions."
        ]), 
        cta: false 
      };
    }
    
    if (lower === 'bye' || lower === 'goodbye' || lower === 'cya' || lower === 'see ya') {
      return { 
        text: getRandomResponse([
          "Goodbye! Feel free to reach out if you have any more questions.",
          "Bye! Have a wonderful day.",
          "See you later! Let us know if you need anything else."
        ]), 
        cta: false 
      };
    }

    // 2. Strict Predefined Intent Matching
    if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('are you ai') || lower.includes('your name')) {
      return {
        text: "I'm ARTAFIC Assistant, the digital assistant for ARTAFIC. I can help you learn about ARTAFIC, our services, and how to get in touch.",
        cta: false
      };
    }

    if (lower.includes('what is artafic') || lower.includes('about artafic') || lower.includes('who is artafic')) {
      return {
        text: "ARTAFIC is a digital agency built to help businesses present themselves better online. We combine design and technology to create clear, intentional, and distinctive digital experiences.",
        cta: false
      };
    }

    if (lower.includes('what do you do') || lower.includes('what does artafic do') || lower.includes('what services do you offer') || lower.includes('service') || lower.includes('offer')) {
      return {
        text: "We offer two focused services: **Web Development** and **Logo Building**. We deliberately keep our focus narrow to ensure high quality in both areas.",
        cta: true
      };
    }

    if (lower.includes('how can you help') || lower.includes('help us')) {
      return {
        text: "We help businesses communicate clearly online. Through custom Web Development and Logo Building, we build digital experiences that leave a strong, professional impression.",
        cta: true
      };
    }

    if (lower.includes('build a website') || lower.includes('create a website') || lower.includes('web development')) {
      return {
        text: "Yes, we specialize in Web Development. We build professional, responsive websites focused on your business goals, customer behavior, and conversion.",
        cta: true
      };
    }

    if (lower.includes('design a logo') || lower.includes('create a logo') || lower.includes('logo building')) {
      return {
        text: "Yes, we offer Logo Building. We design custom logos that give your business a cleaner, more professional visual identity.",
        cta: true
      };
    }

    if (lower.includes('who is artafic for') || lower.includes('ideal client')) {
      return {
        text: "ARTAFIC is for businesses that have something valuable to offer but feel their current digital presence doesn't reflect that value effectively.",
        cta: false
      };
    }

    if (lower.includes('contact') || lower.includes('work with you') || lower.includes('hire') || lower.includes('get in touch') || lower.includes('reach out')) {
      return {
        text: "We'd love to hear from you! You can use our contact form to get in touch and discuss your project.",
        cta: true
      };
    }

    // 3. Fallbacks for existing FAQ button mappings
    if (lower.includes('process') || lower.includes('work') || lower.includes('how do you work')) {
      return faqAnswers.process;
    }
    if (lower.includes('cost') || lower.includes('price') || lower.includes('much') || lower.includes('pricing')) {
      return faqAnswers.cost;
    }
    if (lower.includes('time') || lower.includes('long') || lower.includes('week') || lower.includes('month')) {
      return faqAnswers.timeline;
    }
    if (lower.includes('redesign') || lower.includes('existing') || lower.includes('current')) {
      return faqAnswers.redesign;
    }
    if (lower.includes('book') || lower.includes('meeting')) {
      return faqAnswers.booking;
    }

    // 4. Unclear Input check (very short or gibberish)
    if (rawText.split(' ').length <= 2) {
      return {
        text: "I'm not quite sure what you mean. Try asking me about ARTAFIC, our services, or working with us.",
        cta: false
      };
    }

    // 5. Unrelated / General Fallback
    return {
      text: getRandomResponse([
        "I'm ARTAFIC Assistant. I can help you with ARTAFIC, our services, or how to get in touch with us.",
        "I don't have information on that. I'm ARTAFIC Assistant, and I can answer questions about our web development and logo services.",
        "I'm not equipped to answer that! I'm here to assist you with questions about ARTAFIC and our offerings."
      ]),
      cta: false
    };
  }

  // Deduplicated fallback handler: using primary intent-matching getFallbackAnswer

  // â”€â”€â”€ Message Rendering â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function renderMessage(text, type = 'bot', hasCta = false) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message chat-message--${type}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-message__avatar';
    avatar.setAttribute('aria-hidden', 'true');
    if (type === 'bot') {
      avatar.style.background = '#0C0C0C';
      avatar.innerHTML = '<img src="assets/chatbot-avatar.png" alt="" style="width:100%;height:100%;object-fit:contain;padding:4px;border-radius:50%;">';
    } else {
      avatar.textContent = 'Y';
    }

    const body = document.createElement('div');
    body.className = 'chat-message__body';

    const bubble = document.createElement('div');
    bubble.className = 'chat-message__bubble';

    // Escape HTML to prevent DOM XSS, then format markdown
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    const safeText = escapeHtml(text);
    const formattedText = safeText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    bubble.innerHTML = formattedText;

    const time = document.createElement('p');
    time.className = 'chat-message__time';
    time.textContent = formatTime();

    body.appendChild(bubble);
    body.appendChild(time);

    if (hasCta && type === 'bot') {
      const cta = document.createElement('a');
      cta.className = 'chat-message__cta';
      cta.href = '#booking';
      cta.innerHTML = `Get In Touch
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      `;
      cta.addEventListener('click', () => {
        closePanel();
      });
      body.appendChild(cta);
    }

    messageEl.appendChild(avatar);
    messageEl.appendChild(body);

    messagesEl.appendChild(messageEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderTypingIndicator() {
    const el = document.createElement('div');
    el.className = 'chat-message chat-message--bot';
    el.id = 'typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'chat-message__avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = 'A';

    const body = document.createElement('div');
    body.className = 'chat-message__body';

    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.setAttribute('aria-label', 'Assistant is typing');
    typing.innerHTML = `
      <span class="chat-typing__dot"></span>
      <span class="chat-typing__dot"></span>
      <span class="chat-typing__dot"></span>
    `;

    body.appendChild(typing);
    el.appendChild(avatar);
    el.appendChild(body);

    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function removeTypingIndicator() {
    const indicator = $('#typing-indicator');
    if (indicator) indicator.remove();
  }

  async function botReply(answerObj) {
    const typingEl = renderTypingIndicator();
    await new Promise(r => setTimeout(r, 900 + Math.random() * 500));
    removeTypingIndicator();
    renderMessage(answerObj.text, 'bot', answerObj.cta);
  }

  // â”€â”€â”€ Open / Close â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function openPanel() {
    isOpen = true;
    launcherBtn.classList.add('is-open');
    panel.classList.add('is-open');
    launcherBtn.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');

    if (badge) badge.style.display = 'none';

    if (!greetingShown) {
      greetingShown = true;
      renderMessage("I'm ARTAFIC Assistant, the digital assistant for ARTAFIC. I can help you learn about ARTAFIC, our services, and how to get in touch.", 'bot', false);
    }

    if (window.innerWidth > 767) { setTimeout(() => input.focus(), 300); }
  }

  function closePanel() {
    isOpen = false;
    launcherBtn.classList.remove('is-open');
    panel.classList.remove('is-open');
    launcherBtn.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    launcherBtn.focus();
  }

  launcherBtn.addEventListener('click', () => {
    isOpen ? closePanel() : openPanel();
  });

  closeBtn.addEventListener('click', closePanel);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  // â”€â”€â”€ Predefined Suggestion Buttons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let isBotReplying = false;

  $$('.chatbot-panel__suggestion', suggestionsEl).forEach(btn => {
    btn.addEventListener('click', async () => {
      if (isBotReplying) return;
      const key = btn.dataset.question;
      renderMessage(btn.textContent, 'user');
      isBotReplying = true;
      try {
        await botReply(faqAnswers[key] || getFallbackAnswer(btn.textContent));
      } finally {
        isBotReplying = false;
      }
    });
  });

  // â”€â”€â”€ User Input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleUserMessage() {
    if (isBotReplying) return;
    let message = input.value.trim();
    if (!message) return;
    if (message.length > 500) {
      message = message.slice(0, 500);
    }

    input.value = '';
    renderMessage(message, 'user');

    isBotReplying = true;
    try {
      const answer = getFallbackAnswer(message);
      await botReply(answer);
    } finally {
      isBotReplying = false;
    }
  }

  sendBtn.addEventListener('click', handleUserMessage);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserMessage();
    }
  });
})();


/* ────────────────────────────────────────────────────────────
   09. ACTIVE NAV LINK (scroll-spy)
   ──────────────────────────────────────────────────────────── */
window.initScrollSpy = function() {
  const isHome = (function() {
    const p = (window.location.pathname || '').toLowerCase();
    return p === '/' || p.endsWith('/index.html') || p.endsWith('/') || !p;
  })();

  if (!isHome) return;

  const navLinks = document.querySelectorAll('.nav__link[data-nav-link], .nav__link[data-section], .nav__mobile-link[data-mobile-nav-link], .nav__mobile-link[data-section]');
  const sectionIds = ['home', 'services', 'before-after', 'portfolio', 'process', 'less-noise', 'booking'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const navHeight = 85;

  function updateActive() {
    let current = 'home';

    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top <= navHeight + 80) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      const sec = link.getAttribute('data-section') || (link.getAttribute('href') || '').replace(/^.*#/, '');
      const isMatch = (sec === current) || (current === 'home' && (sec === 'home' || link.getAttribute('href') === 'index.html' || link.getAttribute('href') === '/'));
      link.classList.toggle('is-active', isMatch);
      link.classList.toggle('nav__link--active', isMatch);
      if (isMatch) {
        link.style.color = 'var(--color-teal)';
        link.style.fontWeight = '600';
      } else {
        link.style.color = '';
        link.style.fontWeight = '';
      }
    });
  }

  window.removeEventListener('scroll', updateActive);
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
};
window.initScrollSpy();


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   10A. HERO 3D SCENE â€” Three.js via ESM CDN
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(async function initHeroThree() {
  const canvas = document.getElementById('aether-canvas') || document.getElementById('hero-three');
  if (!canvas) return;

  // Skip on reduced-motion or if WebGL not supported
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.WebGLRenderingContext) return;

  // â”€â”€ Dynamically load Three.js from ESM CDN (no npm needed) â”€â”€
  let THREE;
  try {
    THREE = await import('https://esm.sh/three@0.163.0');
  } catch (e) {
    console.warn('Three.js failed to load:', e);
    return;
  }

  // â”€â”€ Renderer â”€â”€
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,          // transparent bg â€” particle canvas shows behind
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);  // fully transparent clear

  // â”€â”€ Scene & Camera â”€â”€
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  // â”€â”€ Teal colour palette â”€â”€
  const TEAL       = 0x14b8a6;
  const TEAL_LIGHT = 0x5eead4;
  const TEAL_DARK  = 0x0d9488;

  // â”€â”€ Main object: Torus Knot â”€â”€
  // Wireframe so the particle canvas shows through the geometry
  const knotGeo = new THREE.TorusKnotGeometry(1.2, 0.38, 180, 24, 2, 3);
  const knotMat = new THREE.MeshStandardMaterial({
    color: TEAL,
    emissive: TEAL,
    emissiveIntensity: 0.35,
    wireframe: false,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
  });
  const knotMesh = new THREE.Mesh(knotGeo, knotMat);
  scene.add(knotMesh);

  // Wireframe overlay on the knot for the mesh-edge glow look
  const wireMat = new THREE.MeshBasicMaterial({
    color: TEAL_LIGHT,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
  });
  const wireMesh = new THREE.Mesh(knotGeo, wireMat);
  scene.add(wireMesh);

  // â”€â”€ Secondary object: Icosahedron orbiting the knot â”€â”€
  const icoGeo  = new THREE.IcosahedronGeometry(0.55, 1);
  const icoMat  = new THREE.MeshStandardMaterial({
    color: TEAL_LIGHT,
    emissive: TEAL,
    emissiveIntensity: 0.5,
    wireframe: false,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
  });
  const icoMesh = new THREE.Mesh(icoGeo, icoMat);
  icoMesh.position.set(2.6, 0.6, -0.5);
  scene.add(icoMesh);

  const icoWireMat  = new THREE.MeshBasicMaterial({ color: TEAL_LIGHT, wireframe: true, transparent: true, opacity: 0.35 });
  const icoWireMesh = new THREE.Mesh(icoGeo, icoWireMat);
  icoWireMesh.position.copy(icoMesh.position);
  scene.add(icoWireMesh);

  // â”€â”€ Third object: Octahedron â€” left side â”€â”€
  const octGeo  = new THREE.OctahedronGeometry(0.42, 0);
  const octMat  = new THREE.MeshStandardMaterial({
    color: TEAL_DARK,
    emissive: TEAL_DARK,
    emissiveIntensity: 0.6,
    wireframe: false,
    transparent: true,
    opacity: 0.25,
  });
  const octMesh = new THREE.Mesh(octGeo, octMat);
  octMesh.position.set(-2.8, -0.4, -0.3);
  scene.add(octMesh);

  const octWireMat  = new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.4 });
  const octWireMesh = new THREE.Mesh(octGeo, octWireMat);
  octWireMesh.position.copy(octMesh.position);
  scene.add(octWireMesh);

  // â”€â”€ Lights â”€â”€
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(TEAL, 3, 12);
  pointLight1.position.set(3, 3, 3);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(TEAL_LIGHT, 2, 10);
  pointLight2.position.set(-3, -2, 2);
  scene.add(pointLight2);

  // â”€â”€ Mouse tracking for camera drift â”€â”€
  const mouse3d = { x: 0, y: 0 };
  const mouseLerped = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse3d.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse3d.y = (e.clientY / window.innerHeight - 0.5) * -2;
  }, { passive: true });

  // â”€â”€ Resize â”€â”€
  function resizeThree() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  window.addEventListener('resize', resizeThree, { passive: true });

  // â”€â”€ Animation loop â”€â”€
  let clock = new THREE.Clock();

  function animateThree() {
    requestAnimationFrame(animateThree);
    const elapsed = clock.getElapsedTime();

    mouseLerped.x += (mouse3d.x - mouseLerped.x) * 0.04;
    mouseLerped.y += (mouse3d.y - mouseLerped.y) * 0.04;

    camera.position.x = mouseLerped.x * 0.6;
    camera.position.y = mouseLerped.y * 0.4;
    camera.lookAt(scene.position);

    knotMesh.rotation.x = elapsed * 0.12;
    knotMesh.rotation.y = elapsed * 0.18;
    wireMesh.rotation.copy(knotMesh.rotation);
    const breathe = 1 + Math.sin(elapsed * 0.8) * 0.04;
    knotMesh.scale.setScalar(breathe);
    wireMesh.scale.setScalar(breathe);

    icoMesh.position.x = Math.cos(elapsed * 0.35) * 2.6;
    icoMesh.position.z = Math.sin(elapsed * 0.35) * 0.8;
    icoMesh.rotation.x = elapsed * 0.5;
    icoMesh.rotation.z = elapsed * 0.3;
    icoWireMesh.position.copy(icoMesh.position);
    icoWireMesh.rotation.copy(icoMesh.rotation);

    octMesh.position.x = Math.cos(elapsed * 0.28 + Math.PI) * 2.8;
    octMesh.position.y = Math.sin(elapsed * 0.22) * 0.6 - 0.4;
    octMesh.rotation.y = elapsed * 0.6;
    octMesh.rotation.x = elapsed * 0.4;
    octWireMesh.position.copy(octMesh.position);
    octWireMesh.rotation.copy(octMesh.rotation);

    pointLight1.intensity = 3 + Math.sin(elapsed * 1.2) * 0.8;

    renderer.render(scene, camera);
  }

  animateThree();
})();


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   10. HERO AETHERFLOW INTERACTIVE PARTICLE CANVAS
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initHeroCanvas() {
  const canvas = document.getElementById('aether-canvas') || document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  const mouse = { x: null, y: null, radius: 180 };

  /* â”€â”€ Particle Class â”€â”€ */
  class Particle {
    constructor(x, y, dx, dy, size, color) {
      this.x = x;
      this.y = y;
      this.baseX = x;
      this.baseY = y;
      this.dx = dx;
      this.dy = dy;
      this.size = size;
      this.color = color;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.shadowColor = 'rgba(20, 184, 166, 0.6)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }

    update() {
      // Wall collision
      if (this.x + this.size > canvas.width || this.x - this.size < 0) this.dx = -this.dx;
      if (this.y + this.size > canvas.height || this.y - this.size < 0) this.dy = -this.dy;

      // Mouse interactive push/repulsion
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const maxDistance = mouse.radius;
          const force = (maxDistance - distance) / maxDistance;
          const directionX = forceDirectionX * force * 4;
          const directionY = forceDirectionY * force * 4;
          this.x -= directionX;
          this.y -= directionY;
        }
      }

      this.x += this.dx;
      this.y += this.dy;
    }
  }

  function init() {
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 10000);
    const particleCount = Math.min(Math.max(count, 45), 110);

    const colors = [
      'rgba(13, 118, 110, 0.75)',   // Darker teal main
      'rgba(15, 94, 89, 0.8)',      // Deeper teal
      'rgba(9, 68, 64, 0.9)',       // Very dark teal accent
      'rgba(100, 116, 139, 0.4)'    // Dark faint slate
    ];

    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 2.2 + 1;
      const x = Math.random() * (canvas.width - size * 4) + size * 2;
      const y = Math.random() * (canvas.height - size * 4) + size * 2;
      const dx = (Math.random() - 0.5) * 0.7;
      const dy = (Math.random() - 0.5) * 0.7;
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push(new Particle(x, y, dx, dy, size, color));
    }
  }

  function connect() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 135) {
          const alpha = (1 - dist / 135) * 0.25;
          ctx.strokeStyle = `rgba(13, 118, 110, ${alpha})`;
          ctx.lineWidth = 0.85;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });
    connect();
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
  }

  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };

  const onMouseOut = () => {
    mouse.x = null;
    mouse.y = null;
  };

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('mouseleave', onMouseOut, { passive: true });

  resize();
  animate();
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   10. ABOUT SECTION SCROLL TEXT REVEAL & MAGNETIC HOVER
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initAboutAnimations() {
  const textEls = document.querySelectorAll('.about-animated-text');
  if (!textEls.length) return;

  textEls.forEach((textEl) => {
    const originalText = textEl.textContent.trim();
    const words = originalText.split(/\s+/);
    textEl.innerHTML = '';
    textEl.style.display = 'flex';
    textEl.style.flexWrap = 'wrap';
    textEl.style.justifyContent = 'center';
    textEl.style.columnGap = '0.28em';
    textEl.style.rowGap = '0.25rem';

    const charSpans = [];
    let globalCharIndex = 0;
    const totalChars = originalText.length;

    words.forEach((word) => {
      const wordWrapper = document.createElement('span');
      wordWrapper.style.display = 'inline-block';
      wordWrapper.style.whiteSpace = 'nowrap';

      const wordChars = word.split('');
      wordChars.forEach((char) => {
        const charContainer = document.createElement('span');
        charContainer.style.position = 'relative';
        charContainer.style.display = 'inline-block';
        charContainer.style.userSelect = 'none';

        const bgSpan = document.createElement('span');
        bgSpan.textContent = char;
        bgSpan.style.color = 'rgba(215, 226, 234, 0.2)';
        bgSpan.setAttribute('aria-hidden', 'true');

        const fgSpan = document.createElement('span');
        fgSpan.textContent = char;
        fgSpan.style.position = 'absolute';
        fgSpan.style.inset = '0';
        fgSpan.style.color = '#D7E2EA';
        fgSpan.style.fontWeight = '500';
        fgSpan.style.opacity = '0.2';
        fgSpan.style.transition = 'opacity 0.1s ease-out';

        charContainer.appendChild(bgSpan);
        charContainer.appendChild(fgSpan);
        wordWrapper.appendChild(charContainer);

        charSpans.push({
          element: fgSpan,
          index: globalCharIndex,
        });

        globalCharIndex++;
      });

      globalCharIndex++;
      textEl.appendChild(wordWrapper);
    });

    function updateTextScrollProgress() {
      const rect = textEl.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const startTrigger = windowHeight * 0.8;
      const endTrigger = windowHeight * 0.2;
      const totalDistance = startTrigger - endTrigger;
      const currentPos = startTrigger - rect.top;

      const progress = Math.min(Math.max(currentPos / totalDistance, 0), 1);

      charSpans.forEach(({ element, index }) => {
        const charProgress = index / totalChars;
        const charStart = Math.max(0, charProgress - 0.15);
        const charEnd = Math.min(1, charProgress + 0.1);

        let charOpacity = 0.2;
        if (progress >= charEnd) {
          charOpacity = 1.0;
        } else if (progress <= charStart) {
          charOpacity = 0.2;
        } else {
          charOpacity = 0.2 + 0.8 * ((progress - charStart) / (charEnd - charStart));
        }

        element.style.opacity = String(charOpacity);
      });
    }

    window.addEventListener('scroll', updateTextScrollProgress, { passive: true });
    updateTextScrollProgress();
  });

  const magnetEls = document.querySelectorAll('[data-magnet]');
  magnetEls.forEach((el) => {
    const strength = 3;
    const padding = 120;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      if (
        Math.abs(distanceX) < rect.width / 2 + padding &&
        Math.abs(distanceY) < rect.height / 2 + padding
      ) {
        el.style.transition = 'transform 0.3s ease-out';
        el.style.transform = `translate3d(${distanceX / strength}px, ${distanceY / strength}px, 0px)`;
      } else {
        el.style.transition = 'transform 0.6s ease-in-out';
        el.style.transform = 'translate3d(0px, 0px, 0px)';
      }
    });

    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.6s ease-in-out';
      el.style.transform = 'translate3d(0px, 0px, 0px)';
    });
  });
})();
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   12. FULL-SCREEN SCROLL STORYTELLING ENGINE
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
window.initTimeline = function() {
  const processSection  = document.getElementById('process');
  const stickyContainer = document.getElementById('process-sticky');
  const flowContainer   = document.getElementById('timeline-flow');
  const progressLine     = document.getElementById('timeline-progress');
  const stepGroups       = document.querySelectorAll('[data-step]');

  if (!processSection || !stickyContainer || !flowContainer || !progressLine || !stepGroups.length) return;

  let ticking = false;

  function remap(val, start1, stop1, start2, stop2) {
    if (val <= start1) return start2;
    if (val >= stop1) return stop2;
    return start2 + (stop2 - start2) * ((val - start1) / (stop1 - start1));
  }

  function updateTimeline() {
    const rect = processSection.getBoundingClientRect();
    const viewH = window.innerHeight;
    const scrollableDistance = rect.height - viewH;

    if (scrollableDistance <= 0) return;

    // Calculate normalized progress 'p' from 0.0 to 1.0
    let p = -rect.top / scrollableDistance;
    p = Math.max(0, Math.min(1, p));

    // 1. Smoothly translate .timeline__flow vertically so active step aligns with viewport center (~160px down from stage top)
    const stageH = stickyContainer.offsetHeight - 120; // Stage height
    const flowTotalH = flowContainer.offsetHeight;
    const targetStageY = stageH * 0.28; // Comfortable vertical focus level

    // Measure positions of first and last step group centers relative to flowContainer
    const firstGroupTop = stepGroups[0].offsetTop + (stepGroups[0].offsetHeight / 2);
    const lastGroupTop  = stepGroups[stepGroups.length - 1].offsetTop + (stepGroups[stepGroups.length - 1].offsetHeight / 2);

    // Initial flow Y position when p = 0 (Step 01 at targetStageY)
    const startFlowY = targetStageY - firstGroupTop;
    // Final flow Y position when p = 1 (Step 04 at targetStageY)
    const endFlowY   = targetStageY - lastGroupTop;

    const currentFlowY = remap(p, 0.0, 1.0, startFlowY, endFlowY);
    flowContainer.style.transform = 'translate3d(0, ' + currentFlowY + 'px, 0)';

    // Update center progress line height based on scroll p
    progressLine.style.height = (p * 100) + '%';

    // 4 Step ranges across 0.0 to 1.0
    const stepRanges = [
      { start: 0.00, end: 0.24 },
      { start: 0.25, end: 0.49 },
      { start: 0.50, end: 0.74 },
      { start: 0.75, end: 1.00 }
    ];

    const isMobile = window.innerWidth <= 767;

    stepGroups.forEach((group, index) => {
      const range  = stepRanges[index];
      const isLeft = group.classList.contains('timeline__step-group--left');
      
      const numWrap   = group.querySelector('[data-anim="number"]');
      const titleWrap = group.querySelector('[data-anim="title"]');
      const descWrap  = group.querySelector('[data-anim="desc"]');
      const connector = group.querySelector('[data-anim="connector"]');
      const dot       = group.querySelector('[data-anim="dot"]');

      if (p < range.start) {
        // UNREVEALED STATE (Before scroll reaches step)
        group.style.opacity = '0';
        const startX = (isLeft && !isMobile) ? -100 : (isMobile ? 20 : 100);
        if (numWrap) {
          numWrap.style.opacity = '0';
          numWrap.style.transform = 'translate3d(' + startX + 'px, 0, 0) scale(0.95)';
        }
        if (titleWrap) {
          titleWrap.style.opacity = '0';
          titleWrap.style.transform = 'translate3d(0, 25px, 0)';
        }
        if (descWrap) {
          descWrap.style.opacity = '0';
          descWrap.style.transform = 'translate3d(0, 20px, 0)';
        }
        if (connector) connector.classList.remove('is-active', 'is-completed');
        if (dot)       dot.classList.remove('is-active', 'is-completed');

      } else if (p > range.end) {
        // COMPLETED STATE (PERSISTENT & VISIBLE ON TIMELINE ABOVE!)
        group.style.opacity = '1';
        if (numWrap) {
          numWrap.style.opacity = '0.65';
          numWrap.style.transform = 'translate3d(0, 0, 0) scale(1)';
        }
        if (titleWrap) {
          titleWrap.style.opacity = '0.75';
          titleWrap.style.transform = 'translate3d(0, 0, 0)';
        }
        if (descWrap) {
          descWrap.style.opacity = '0.50';
          descWrap.style.transform = 'translate3d(0, 0, 0)';
        }
        if (connector) {
          connector.classList.remove('is-active');
          connector.classList.add('is-completed');
        }
        if (dot) {
          dot.classList.remove('is-active');
          dot.classList.add('is-completed');
        }

      } else {
        // ACTIVE STATE IN RANGE
        group.style.opacity = '1';
        const localP = (p - range.start) / (range.end - range.start);

        if (dot) {
          dot.classList.add('is-active');
          dot.classList.remove('is-completed');
        }
        if (connector) {
          connector.classList.add('is-active');
          connector.classList.remove('is-completed');
        }

        // Sub-phase 1 (Number: 0.00 -> 0.20)
        const numOpacity = remap(localP, 0.00, 0.20, 0, 1);
        const numScale   = remap(localP, 0.00, 0.20, 0.95, 1.0);
        const numStartX  = (isLeft && !isMobile) ? -100 : (isMobile ? 20 : 100);
        const numX       = remap(localP, 0.00, 0.20, numStartX, 0);

        if (numWrap) {
          numWrap.style.opacity = numOpacity;
          numWrap.style.transform = 'translate3d(' + numX + 'px, 0, 0) scale(' + numScale + ')';
        }

        // Sub-phase 2 (Title: 0.20 -> 0.40)
        const titleOpacity = remap(localP, 0.20, 0.40, 0, 1);
        const titleY       = remap(localP, 0.20, 0.40, 25, 0);

        if (titleWrap) {
          titleWrap.style.opacity = titleOpacity;
          titleWrap.style.transform = 'translate3d(0, ' + titleY + 'px, 0)';
        }

        // Sub-phase 3 (Description: 0.40 -> 0.60)
        const descOpacity = remap(localP, 0.40, 0.60, 0, 1);
        const descY       = remap(localP, 0.40, 0.60, 20, 0);

        if (descWrap) {
          descWrap.style.opacity = descOpacity;
          descWrap.style.transform = 'translate3d(0, ' + descY + 'px, 0)';
        }

        // Sub-phase 4 (MANDATORY HOLD / READING PERIOD: 0.60 -> 0.82)
        // Active step remains at 100% opacity with zero movement

        // Sub-phase 5 (Transition to Completed State: 0.82 -> 1.00, except step 4)
        const isFinalStep = (index === stepGroups.length - 1);
        if (!isFinalStep && localP > 0.82) {
          if (numWrap)   numWrap.style.opacity   = remap(localP, 0.82, 1.00, 1.00, 0.65);
          if (titleWrap) titleWrap.style.opacity = remap(localP, 0.82, 1.00, 1.00, 0.75);
          if (descWrap)  descWrap.style.opacity  = remap(localP, 0.82, 1.00, 1.00, 0.50);
        }
      }
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateTimeline);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
};
window.initTimeline();

/* ------------------------------------------------------------
   13. MARQUEE SCROLL ANIMATION
   ------------------------------------------------------------ */

let marqueeLoopId = null;
window.initMarquee = function() {
  const section = document.getElementById('marquee');
  const track1 = document.getElementById('marquee-track-1');
  const track2 = document.getElementById('marquee-track-2');

  if (!section || !track1 || !track2) return;

  let currentOffset = 0;
  let targetOffset = 0;

  function loop() {
    // Linear interpolation (Lerp) for premium buttery smooth momentum
    currentOffset += (targetOffset - currentOffset) * 0.08;

    // Use translate3d to force hardware GPU acceleration
    track1.style.transform = `translate3d(${currentOffset - 200}px, 0, 0)`;
    track2.style.transform = `translate3d(${-(currentOffset - 200)}px, 0, 0)`;

    if (!document.getElementById('marquee-track-1')) {
      marqueeLoopId = null;
      return;
    }
    marqueeLoopId = requestAnimationFrame(loop);
  }

  function handleScroll() {
    const rect = section.getBoundingClientRect();
    // Calculate offset based on scroll position relative to viewport
    targetOffset = (window.innerHeight - rect.top) * 0.45;
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll, { passive: true });
  handleScroll();
  loop(); // Start the render loop
};
window.initMarquee();

/* ------------------------------------------------------------
   14. AETHER CANVAS ANIMATION
   ------------------------------------------------------------ */
let aetherCanvasAnimId = null;
window.initAetherCanvas = function() {
  const canvas = document.getElementById('aether-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (aetherCanvasAnimId) {
    cancelAnimationFrame(aetherCanvasAnimId);
    aetherCanvasAnimId = null;
  }
  let animationFrameId;
  let particles = [];
  const mouse = { x: null, y: null, radius: 200 };

  class Particle {
    constructor(x, y, directionX, directionY, size, color) {
      this.x = x;
      this.y = y;
      this.directionX = directionX;
      this.directionY = directionY;
      this.size = size;
      this.color = color;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    update() {
      if (this.x > canvas.width || this.x < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.directionY = -this.directionY;
      }

      // Mouse collision detection
      if (mouse.x !== null && mouse.y !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius + this.size) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          this.x -= forceDirectionX * force * 5;
          this.y -= forceDirectionY * force * 5;
        }
      }

      this.x += this.directionX;
      this.y += this.directionY;
      this.draw();
    }
  }

  function init() {
    particles = [];
    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
      let size = (Math.random() * 2) + 1;
      let x = (Math.random() * ((window.innerWidth - size * 2) - (size * 2)) + size * 2);
      let y = (Math.random() * ((window.innerHeight - size * 2) - (size * 2)) + size * 2);
      let directionX = (Math.random() * 0.4) - 0.2;
      let directionY = (Math.random() * 0.4) - 0.2;
      let color = 'rgba(191, 128, 255, 0.8)'; // Brighter purple
      particles.push(new Particle(x, y, directionX, directionY, size, color));
    }
  }

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init(); 
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const connect = () => {
    let opacityValue = 1;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
            + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
        
        if (distance < (canvas.width / 7) * (canvas.height / 7)) {
          opacityValue = 1 - (distance / 20000);
          
          let dx_mouse_a = mouse.x ? particles[a].x - mouse.x : 0;
          let dy_mouse_a = mouse.y ? particles[a].y - mouse.y : 0;
          let distance_mouse_a = Math.sqrt(dx_mouse_a*dx_mouse_a + dy_mouse_a*dy_mouse_a);

          if (mouse.x && distance_mouse_a < mouse.radius) {
               ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue})`;
          } else {
               ctx.strokeStyle = `rgba(200, 150, 255, ${opacityValue})`;
          }
          
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  };

  const animate = () => {
    if (!document.getElementById('aether-canvas')) {
      aetherCanvasAnimId = null;
      return;
    }
    aetherCanvasAnimId = animationFrameId = requestAnimationFrame(animate);
    // Use clearRect so we don't overwrite CSS background, or fill with black if intended
    // The original react code used black fill, let's keep it transparent just in case index.html has a background
    // If they strictly want black, uncomment the below lines. We will use clearRect for better integration with existing HTML.
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
    }
    connect();
  };
  
  const handleMouseMove = (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  };
  
  const handleMouseOut = () => {
    mouse.x = null;
    mouse.y = null;
  };

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseout', handleMouseOut);

  init();
  animate();
};
window.initAetherCanvas();

/* ------------------------------------------------------------
   16. SERVICES NATURAL CANVAS SCROLL & STROKE ANIMATION
   ------------------------------------------------------------ */
window.initServicesStrokeFollowScroll = function() {
  const section = document.getElementById('services');
  const path = document.getElementById('services-scroll-path');
  const stage = document.getElementById('services-panning-stage');
  const endpointBox = document.getElementById('services-flow-endpoint');

  if (!section || !path || !stage) return;

  const pathLength = path.getTotalLength();
  path.style.strokeDasharray = `${pathLength} ${pathLength}`;
  path.style.strokeDashoffset = `${pathLength}`;

  function updateTimeline() {
    if (!document.getElementById('services')) return;
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const sectionHeight = section.offsetHeight;

    // Framer Motion offset: ["start start", "end end"]
    // Starts when top of track reaches top of screen (rect.top == 0)
    // Ends when bottom of track reaches bottom of screen (rect.bottom == windowHeight)
    // Total scroll distance WHILE PINNED is sectionHeight - windowHeight
    const pinnedScrollRange = sectionHeight - windowHeight;
    
    // Progress is strictly 0 when rect.top >= 0, and reaches 1 when rect.top <= -pinnedScrollRange
    const progress = Math.max(0, Math.min(1, -rect.top / pinnedScrollRange));

    // TIMELINE MAPPED TO PINNED SCROLL PROGRESS (0.0 to 1.0):
    // 0.00 - 0.28: PHASE 1 Gï¿½ï¿½ STARTING MASHUP LOOPS
    //              Stroke draws the 3-4 top mashup loops (0% -> 38% path length).
    //              Camera stays LOCKED at top (panProgress = 0) so the user can watch all 3-4 loops draw right over "Our Services".
    //
    // 0.28 - 0.88: PHASE 2 Gï¿½ï¿½ DOWNWARD TRAVEL & CAMERA PAN (starts slightly earlier, expanded timeline)
    //              Stroke draws down from mashup to Services Box (38% -> 100% path length).
    //              Camera smoothly pans down following the leading tip of the line (panProgress = 0 -> 1).
    //              Services Box fades in between 0.38 and 0.70 so the destination is clearly visible ahead of the line.
    //
    // 0.88 - 1.00: PHASE 3 Gï¿½ï¿½ FINAL CONNECTED HOLD
    //              Line touches terminal dot on Services Box. Composition holds fixed before section unpins.

    let strokeProgress = 0;
    let panProgress = 0;

    if (progress <= 0.20) {
      // Phase 1: Draw upper mashup loops (0% to 38% of stroke) while camera stays stationary at top
      strokeProgress = (progress / 0.20) * 0.38;
      panProgress = 0;
    } else if (progress <= 0.85) {
      // Phase 2: Downward travel (38% to 100% of stroke) and camera pan (0% to 100%)
      const localP = (progress - 0.20) / 0.65;
      strokeProgress = 0.38 + (localP * 0.62);
      panProgress = Math.pow(localP, 1.15);
    } else {
      // Phase 3: Hold connected state
      strokeProgress = 1;
      panProgress = 1;
    }

    // Apply Stroke Drawing
    const drawLength = pathLength * strokeProgress;
    path.style.strokeDashoffset = `${pathLength - drawLength}`;

    // Calculate exact Y coordinate of SVG endpoint dynamically (original proportional scale)
    let maxPanDistance = 0;
    if (endpointBox) {
      const svg = document.querySelector('.services-panning-svg');
      if (svg) {
        const baseWidth = svg.clientWidth;
        const viewBoxWidth = 1278;
        const cssTransformScale = 1.0; // Original proportional size (no extra scaling)
        
        const finalScale = (baseWidth / viewBoxWidth) * cssTransformScale;
        
        // The stroke ends at roughly Y = 2669 in the viewBox coordinates
        const svgEndY = 2669;
        const stageY = svgEndY * finalScale;
        
        // Position the endpoint box exactly at the line's tip (adjusting 11px for the 22px dot)
        endpointBox.style.top = `${stageY - 11}px`;
        
        // Calculate maxPanDistance so that when panProgress = 1.0, 
        // the entire Services box is completely visible with breathing room below it (no bottom cropping)
        const cardHeight = endpointBox.offsetHeight;
        const minTop = window.innerWidth <= 767 ? 68 : 75;
        const desiredTopInViewport = Math.max(minTop, windowHeight - cardHeight - 25);
        maxPanDistance = stageY - desiredTopInViewport;
      }
    }
    
    // Ensure stage is tall enough to contain the endpoint box
    const requiredStageHeight = endpointBox ? parseFloat(endpointBox.style.top || 0) + endpointBox.offsetHeight + 100 : 2600;
    if (stage.offsetHeight < requiredStageHeight) {
      stage.style.height = `${requiredStageHeight}px`;
    }
    
    const maxPossiblePan = stage.offsetHeight - windowHeight;
    maxPanDistance = Math.max(0, Math.min(maxPanDistance, maxPossiblePan));

    // Apply Camera Panning
    const currentPan = panProgress * maxPanDistance;
    stage.style.transform = `translate3d(0, -${currentPan}px, 0)`;

    // Services Box Visibility Fade In
    // Fades in gradually during Phase 2 (between 0.38 and 0.70 progress) so it is completely visible well before line arrives
    if (endpointBox) {
      if (progress < 0.38) {
        endpointBox.style.opacity = '0';
      } else if (progress < 0.70) {
        endpointBox.style.opacity = String(((progress - 0.38) / 0.32).toFixed(2));
      } else {
        endpointBox.style.opacity = '1';
      }
    }
  }

  window.addEventListener('scroll', updateTimeline, { passive: true });
  window.addEventListener('resize', updateTimeline, { passive: true });

  // Mobile services card swipe dots sync
  const servicesGrid = document.querySelector('.services-endpoint-grid');
  const serviceDots = document.querySelectorAll('.services-dot');
  if (servicesGrid && serviceDots.length) {
    servicesGrid.addEventListener('scroll', () => {
      const scrollLeft = servicesGrid.scrollLeft;
      const cardWidth = servicesGrid.firstElementChild ? servicesGrid.firstElementChild.offsetWidth : 300;
      const activeIdx = Math.round(scrollLeft / cardWidth);
      serviceDots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === activeIdx);
      });
    }, { passive: true });

    serviceDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-service-idx') || '0', 10);
        const card = servicesGrid.children[idx];
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    });
  }
  
  // Initial call
  setTimeout(updateTimeline, 100);
};
window.initServicesStrokeFollowScroll();











/* ============================================================
   UNIVERSAL FLOATING PATHS BACKGROUND ENGINE (Multi-Theme)
   ============================================================ */
function createFloatingPathsSVG(position, theme) {
  const p = typeof position === 'number' ? position : parseFloat(position || '1');
  const numPaths = window.innerWidth < 768 ? 20 : 36;
  let paths = '';

  for (let i = 0; i < numPaths; i++) {
    // Exact mathematical formula from floating-paths.tsx
    const mX = -(380 - i * 5 * p);
    const mY = -(189 + i * 6);
    const c1X = -(380 - i * 5 * p);
    const c1Y = -(189 + i * 6);
    const c2X = -(312 - i * 5 * p);
    const c2Y = 216 - i * 6;
    const c3X = 152 - i * 5 * p;
    const c3Y = 343 - i * 6;
    const c4X = 616 - i * 5 * p;
    const c4Y = 470 - i * 6;
    const c5X = 684 - i * 5 * p;
    const c5Y = 875 - i * 6;
    const c6X = 684 - i * 5 * p;
    const c6Y = 875 - i * 6;

    const d = `M${mX} ${mY}C${c1X} ${c1Y} ${c2X} ${c2Y} ${c3X} ${c3Y}C${c4X} ${c4Y} ${c5X} ${c5Y} ${c6X} ${c6Y}`;
    const width = (0.5 + i * 0.03).toFixed(2);

    let color;
    if (theme === 'light') {
      // Light background: subtle slate-950 / slate-900 (rgba(15,23,42,...)) + occasional teal accent
      if (i % 6 === 0) {
        color = `rgba(20, 184, 166, ${(0.10 + i * 0.005).toFixed(3)})`;
      } else {
        color = `rgba(15, 23, 42, ${(0.035 + i * 0.005).toFixed(3)})`;
      }
    } else {
      // Dark background: subtle white + electric teal accents
      if (i % 5 === 0) {
        color = `rgba(20, 184, 166, ${(0.09 + i * 0.007).toFixed(3)})`;
      } else {
        color = `rgba(255, 255, 255, ${(0.025 + i * 0.004).toFixed(3)})`;
      }
    }

    paths += `<path d="${d}" stroke="${color}" stroke-width="${width}" fill="none" class="fp-path" />\n`;
  }

  return `<svg class="fp-svg" viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden="true">\n${paths}</svg>`;
}

function initFloatingPaths() {
  document.querySelectorAll('.floating-paths-bg').forEach((container) => {
    if (container.__fpInitialized) return;
    container.__fpInitialized = true;

    const pos = parseFloat(container.dataset.pos || '1');
    let theme = container.dataset.theme;

    if (!theme || theme === 'auto') {
      const parent = container.parentElement;
      if (parent) {
        const bg = window.getComputedStyle(parent).backgroundColor;
        const rgb = bg.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          const lum = 0.299 * parseInt(rgb[0], 10) + 0.587 * parseInt(rgb[1], 10) + 0.114 * parseInt(rgb[2], 10);
          theme = lum >= 128 ? 'light' : 'dark';
        } else {
          theme = 'dark';
        }
      } else {
        theme = 'dark';
      }
    }

    container.innerHTML = createFloatingPathsSVG(pos, theme);
  });
}

// Export to window and run on DOM ready / script load
window.initFloatingPaths = initFloatingPaths;
/* ============================================================
   KINETIC CRAFT ANIMATION ("YOUR BUSINESS. OUR CRAFT.")
   ============================================================ */
function initKineticCraftAnimation() {
  const lessNoiseSec = document.querySelector('.less-noise');
  if (!lessNoiseSec) return;

  const word1 = lessNoiseSec.querySelector('.less-noise__word1');
  const word2 = lessNoiseSec.querySelector('.less-noise__word2');
  if (!word1 || !word2) return;

  const glow = lessNoiseSec.querySelector('.less-noise__glow');
  let ticking = false;

  function updateCraftKinetic() {
    const rect = lessNoiseSec.getBoundingClientRect();
    const winH = window.innerHeight;
    const scrollDistance = rect.height - winH;

    if (scrollDistance <= 0) return;

    // Calculate pinned progress:
    // 0 when section top reaches top of viewport (pinned)
    // 1 when section bottom reaches bottom of viewport (unpinned)
    let progress = 0;
    if (rect.top <= 0 && rect.bottom >= winH) {
      progress = -rect.top / scrollDistance;
    } else if (rect.top > 0) {
      // User is ABOVE the section scrolling down
      progress = 0;
    } else {
      // User has scrolled PAST the section
      progress = 1;
    }

    progress = Math.max(0, Math.min(1, progress));

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Word 1: "YOUR BUSINESS."
    // 0.00 -> 0.28: Solid hold at 100% opacity, scale 1.0 (clear, unmistakable visibility)
    // 0.28 -> 0.50: Smooth cinematic fade out (1 -> 0) and subtle scale expansion (1.0 -> 1.08)
    // > 0.50: Completely hidden
    if (progress <= 0.28) {
      word1.style.opacity = '1';
      word1.style.transform = 'translate(-50%, -50%) scale(1)';
    } else if (progress <= 0.50) {
      const p1 = (progress - 0.28) / 0.22;
      const op1 = Math.max(0, 1 - p1);
      const sc1 = prefersReducedMotion ? 1 : 1 + (p1 * 0.08);
      word1.style.opacity = op1.toFixed(3);
      word1.style.transform = `translate(-50%, -50%) scale(${sc1.toFixed(3)})`;
    } else {
      word1.style.opacity = '0';
      word1.style.transform = prefersReducedMotion ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) scale(1.08)';
    }

    // Word 2: "OUR CRAFT."
    // < 0.35: Completely hidden
    // 0.35 -> 0.55: Smooth fade in (0 -> 1) and gentle scale settling (0.92 -> 1.0)
    // 0.55 -> 0.90: Solid hold at 100% opacity, scale 1.0 (generous reading time)
    // 0.90 -> 1.00: Stays visible as section unpins into Booking form
    if (progress < 0.35) {
      word2.style.opacity = '0';
      word2.style.transform = prefersReducedMotion ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) scale(0.92)';
    } else if (progress <= 0.55) {
      const p2 = (progress - 0.35) / 0.20;
      const op2 = Math.min(1, p2);
      const sc2 = prefersReducedMotion ? 1 : 0.92 + (p2 * 0.08);
      word2.style.opacity = op2.toFixed(3);
      word2.style.transform = `translate(-50%, -50%) scale(${sc2.toFixed(3)})`;
    } else {
      word2.style.opacity = '1';
      word2.style.transform = 'translate(-50%, -50%) scale(1)';
    }

    // Ambient glow breathing pulse during transition
    if (glow) {
      const pulse = Math.sin(progress * Math.PI);
      const glowScale = prefersReducedMotion ? 1 : 1 + (pulse * 0.20);
      const glowOp = 0.16 + (pulse * 0.10);
      glow.style.transform = `translate(-50%, -50%) scale(${glowScale.toFixed(2)})`;
      glow.style.opacity = glowOp.toFixed(2);
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateCraftKinetic);
      ticking = true;
    }
  }

  if (!lessNoiseSec._kineticListenerAttached) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    lessNoiseSec._kineticListenerAttached = true;
  }

  updateCraftKinetic();
}
window.initKineticCraftAnimation = initKineticCraftAnimation;

/* ────────────────────────────────────────────────────────────
   09. PROBLEM SECTION TELEMETRY & HOTSPOT INTERACTION
   ──────────────────────────────────────────────────────────── */
function initProblemTelemetry() {
  const problemSec = document.getElementById('problem');
  if (!problemSec) return;

  const cards = problemSec.querySelectorAll('.problem__card');
  const hotspots = problemSec.querySelectorAll('.problem__hotspot');
  const hudFrame = problemSec.querySelector('#problem-telemetry-hud');

  // 1. Hotspot Card Synchronized Hover
  cards.forEach(card => {
    const spotId = card.getAttribute('data-hotspot');
    if (!spotId) return;

    card.addEventListener('mouseenter', () => {
      hotspots.forEach(h => {
        if (h.getAttribute('data-hotspot-id') === spotId) {
          h.classList.add('is-highlighted');
        } else {
          h.classList.remove('is-highlighted');
        }
      });
    });

    card.addEventListener('mouseleave', () => {
      hotspots.forEach(h => h.classList.remove('is-highlighted'));
    });
  });

  hotspots.forEach(hotspot => {
    const spotId = hotspot.getAttribute('data-hotspot-id');
    if (!spotId) return;

    hotspot.addEventListener('mouseenter', () => {
      cards.forEach(c => {
        if (c.getAttribute('data-hotspot') === spotId) {
          c.classList.add('is-active');
        } else {
          c.classList.remove('is-active');
        }
      });
    });

    hotspot.addEventListener('mouseleave', () => {
      cards.forEach(c => c.classList.remove('is-active'));
    });
  });

  // 2. Subtle 3D Mouse Parallax on Desktop
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && hudFrame && window.innerWidth > 992) {
    let hudTicking = false;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;

    hudFrame.addEventListener('mousemove', (e) => {
      const rect = hudFrame.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      targetRotateY = ((x - centerX) / centerX) * 4; // max 4 deg
      targetRotateX = -((y - centerY) / centerY) * 4; // max 4 deg

      if (!hudTicking) {
        hudTicking = true;
        requestAnimationFrame(updateHudTilt);
      }
    });

    hudFrame.addEventListener('mouseleave', () => {
      targetRotateX = 0;
      targetRotateY = 0;
      if (!hudTicking) {
        hudTicking = true;
        requestAnimationFrame(updateHudTilt);
      }
    });

    function updateHudTilt() {
      currentRotateX += (targetRotateX - currentRotateX) * 0.12;
      currentRotateY += (targetRotateY - currentRotateY) * 0.12;

      hudFrame.style.transform = `perspective(1000px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;

      if (Math.abs(targetRotateX - currentRotateX) > 0.02 || Math.abs(targetRotateY - currentRotateY) > 0.02) {
        requestAnimationFrame(updateHudTilt);
      } else {
        hudFrame.style.transform = targetRotateX === 0 ? '' : `perspective(1000px) rotateX(${targetRotateX}deg) rotateY(${targetRotateY}deg)`;
        hudTicking = false;
      }
    }
  }
}
window.initProblemTelemetry = initProblemTelemetry;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initFloatingPaths();
    initKineticCraftAnimation();
    initProblemTelemetry();
  });
} else {
  initFloatingPaths();
  initKineticCraftAnimation();
  initProblemTelemetry();
}

/* ============================================================
   ARTAFIC SITE-WIDE PAGE TRANSITION — ULTRA SMOOTH PJAX ENGINE
   ============================================================ */

// Global Script Re-initializer for Page Transitions
window.reinitPageScripts = function(targetUrl) {
  try {
    if (typeof window.updateActiveNavLinks === 'function') {
      window.updateActiveNavLinks(targetUrl || window.location.href);
    }
    if (typeof window.initFloatingPaths === 'function') {
      window.initFloatingPaths();
    }
    if (typeof window.initKineticCraftAnimation === 'function') {
      window.initKineticCraftAnimation();
    }
    if (typeof window.initProblemTelemetry === 'function') {
      window.initProblemTelemetry();
    }
    // 1. Scroll Reveal Observer (handles all [data-reveal], .fade-up, .reveal-text-inner)
    if (typeof window.initScrollReveal === 'function') {
      window.initScrollReveal();
    }

    // 2. Accordion (FAQ & Services)
    if (typeof window.initAccordion === 'function') {
      window.initAccordion();
    }

    // 3. Before / After Slider
    if (typeof window.initSlider === 'function') {
      window.initSlider();
    }

    // 4. Booking Form (Hardened PJAX Reinitialization)
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
      const successEl = document.getElementById('booking-success');
      const ALLOWED_SERVICES = ['web-development', 'logo-design', 'both', 'not-sure'];
      const SERVICE_NAMES = {
        'web-development': 'Web Development',
        'logo-design': 'Logo Design',
        'both': 'Web Development & Logo Design',
        'not-sure': 'General Inquiry'
      };

      bookingForm.onsubmit = function(e) {
        e.preventDefault();
        const rawName = (document.getElementById('field-name')?.value || '').trim();
        const rawEmail = (document.getElementById('field-email')?.value || '').trim();
        const rawService = document.getElementById('field-service')?.value || '';
        const rawDesc = (document.getElementById('field-description')?.value || '').trim();

        if (rawName.length < 2 || rawName.length > 100) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) || rawEmail.length > 100) return;
        if (!ALLOWED_SERVICES.includes(rawService)) return;

        const cleanName = rawName.replace(/[\r\n\x00-\x1f]+/g, ' ').slice(0, 100);
        const cleanEmail = rawEmail.replace(/[\r\n\x00-\x1f]+/g, '').slice(0, 100);
        const cleanService = SERVICE_NAMES[rawService] || 'Project Inquiry';
        const cleanDesc = rawDesc.slice(0, 2000);

        const subject = encodeURIComponent(`Project Inquiry: ${cleanService} - ${cleanName}`);
        const body = encodeURIComponent(
          `Name: ${cleanName}\nEmail: ${cleanEmail}\nService: ${cleanService}\n\nProject Details:\n${cleanDesc}\n\n---\nSent via artafic.com inquiry form`
        );

        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Preparing Message…';
        }

        window.location.href = `mailto:hello@artafic.com?subject=${subject}&body=${body}`;

        setTimeout(() => {
          bookingForm.style.display = 'none';
          if (successEl) {
            successEl.classList.add('is-visible');
            successEl.focus();
          }
        }, 300);
      };
    }

    // 5. Home Page Specific Animations
    if (document.getElementById('aether-canvas') || document.getElementById('home')) {
      if (typeof window.initAetherCanvas === 'function') window.initAetherCanvas();
      if (typeof window.initTimeline === 'function') window.initTimeline();
      if (typeof window.initMarquee === 'function') window.initMarquee();
      if (typeof window.initServicesStrokeFollowScroll === 'function') window.initServicesStrokeFollowScroll();
      if (typeof window.initScrollSpy === 'function') window.initScrollSpy();
    }

    // 6. About Page Scripts
    if (document.querySelector('.about-hero') || document.querySelector('.about-page')) {
      if (typeof window.initAboutPage === 'function') {
        window.initAboutPage();
      } else if (!document.querySelector('script[src*="about.js"]')) {
        const s = document.createElement('script');
        s.src = 'js/about.js?v=3.3';
        s.onload = () => {
          if (typeof window.initAboutPage === 'function') {
            window.initAboutPage();
          }
        };
        document.body.appendChild(s);
      }
    }

    // 7. GridPulse Background Animation
    if (document.querySelector('.grid-pulse')) {
      if (typeof window.initGridPulse === 'function') {
        window.initGridPulse();
      } else if (!document.querySelector('script[src*="grid-pulse.js"]')) {
        const s = document.createElement('script');
        s.src = 'js/grid-pulse.js?v=1.0';
        s.onload = () => {
          if (typeof window.initGridPulse === 'function') {
            window.initGridPulse();
          }
        };
        document.body.appendChild(s);
      }
    }

  } catch (err) {
    console.error('Error re-initializing page scripts:', err);
  }
};

(function initPageTransitions() {
  function ensureOverlay() {
    let style = document.getElementById('artafic-transition-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'artafic-transition-style';
      style.textContent = `
        .artafic-transition-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 999999 !important;
          pointer-events: none !important;
          overflow: hidden !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }

        .artafic-transition-overlay.is-visible {
          visibility: visible !important;
          opacity: 1 !important;
        }

        .artafic-transition-overlay.is-active {
          pointer-events: auto !important;
        }

        /* 4 Wave Layers */
        .artafic-wave-layer {
          position: absolute !important;
          top: -200vh !important;
          left: 0 !important;
          width: 100vw !important;
          height: 200vh !important;
          transform: translate3d(0, 0%, 0) !important;
          transition: transform 0.85s cubic-bezier(0.76, 0, 0.24, 1) !important;
          will-change: transform !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
        }

        .artafic-wave-layer .wave-svg-top {
          width: 100% !important;
          height: 14vh !important;
          display: block !important;
          margin-bottom: -1px !important;
          flex-shrink: 0 !important;
        }

        .artafic-wave-layer .wave-solid-fill {
          width: 100% !important;
          height: 172vh !important;
          flex-shrink: 0 !important;
        }

        .artafic-wave-layer .wave-svg-bottom {
          width: 100% !important;
          height: 14vh !important;
          display: block !important;
          margin-top: -1px !important;
          flex-shrink: 0 !important;
        }

        /* Layer Colors */
        .wl-1 .wave-solid-fill { background-color: #C6EBC5 !important; }
        .wl-1 svg path { fill: #C6EBC5 !important; }
        .wl-1 { box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25) !important; }

        .wl-2 .wave-solid-fill { background-color: #52B788 !important; }
        .wl-2 svg path { fill: #52B788 !important; }
        .wl-2 { box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3) !important; }

        .wl-3 .wave-solid-fill { background-color: #14B8A6 !important; }
        .wl-3 svg path { fill: #14B8A6 !important; }
        .wl-3 { box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35) !important; }

        .wl-4 .wave-solid-fill { background-color: #0a1012 !important; }
        .wl-4 svg path { fill: #0a1012 !important; }

        /* ENTER: Waves sweep down to layered positions covering the entire screen */
        .artafic-transition-overlay.is-entering .wl-1 { transform: translate3d(0, 62%, 0) !important; transition-delay: 0ms !important; }
        .artafic-transition-overlay.is-entering .wl-2 { transform: translate3d(0, 48%, 0) !important; transition-delay: 120ms !important; }
        .artafic-transition-overlay.is-entering .wl-3 { transform: translate3d(0, 34%, 0) !important; transition-delay: 240ms !important; }
        .artafic-transition-overlay.is-entering .wl-4 { transform: translate3d(0, 20%, 0) !important; transition-delay: 360ms !important; }

        /* COVERED STATE: Locked in composition */
        .artafic-transition-overlay.is-covered .wl-1 { transform: translate3d(0, 62%, 0) !important; transition: none !important; }
        .artafic-transition-overlay.is-covered .wl-2 { transform: translate3d(0, 48%, 0) !important; transition: none !important; }
        .artafic-transition-overlay.is-covered .wl-3 { transform: translate3d(0, 34%, 0) !important; transition: none !important; }
        .artafic-transition-overlay.is-covered .wl-4 { transform: translate3d(0, 20%, 0) !important; transition: none !important; }

        /* EXIT: Waves continue sweeping down off bottom of viewport */
        .artafic-transition-overlay.is-exiting .artafic-wave-layer {
          transform: translate3d(0, 160%, 0) !important;
        }
        .artafic-transition-overlay.is-exiting .wl-4 { transition-duration: 0.85s !important; transition-delay: 0ms !important; }
        .artafic-transition-overlay.is-exiting .wl-3 { transition-duration: 0.85s !important; transition-delay: 100ms !important; }
        .artafic-transition-overlay.is-exiting .wl-2 { transition-duration: 0.85s !important; transition-delay: 200ms !important; }
        .artafic-transition-overlay.is-exiting .wl-1 { transition-duration: 0.85s !important; transition-delay: 300ms !important; }

        /* Centered Destination Title Wrap */
        .artafic-transition-title-wrap {
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) scale(0.92) !important;
          z-index: 10 !important;
          text-align: center !important;
          pointer-events: none !important;
          opacity: 0 !important;
          transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .artafic-transition-title-wrap.is-visible {
          opacity: 1 !important;
          transform: translate(-50%, -50%) scale(1) !important;
        }

        .artafic-transition-title-wrap.is-fading {
          opacity: 0 !important;
          transform: translate(-50%, -60%) scale(0.96) !important;
          transition: opacity 0.25s ease, transform 0.25s ease !important;
        }

        .artafic-transition-subtitle {
          font-family: 'Kanit', 'Montserrat', sans-serif !important;
          font-size: 0.85rem !important;
          font-weight: 600 !important;
          letter-spacing: 0.35em !important;
          text-transform: uppercase !important;
          color: #14B8A6 !important;
          margin-bottom: 0.4rem !important;
          text-shadow: 0 0 15px rgba(20, 184, 166, 0.5) !important;
        }

        .artafic-transition-title {
          font-family: 'Kanit', 'Montserrat', sans-serif !important;
          font-size: clamp(2.4rem, 6.5vw, 4.8rem) !important;
          font-weight: 800 !important;
          letter-spacing: 0.08em !important;
          text-transform: uppercase !important;
          color: #FFFFFF !important;
          margin: 0 !important;
          line-height: 1.1 !important;
          text-shadow: 0 4px 25px rgba(0, 0, 0, 0.7), 0 0 35px rgba(20, 184, 166, 0.35) !important;
        }
      `;
      document.head.appendChild(style);
    }

    let overlay = document.getElementById('artafic-transition-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'artafic-transition-overlay';
      overlay.className = 'artafic-transition-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = `
        <!-- Layer 1: Mint Green -->
        <div class="artafic-wave-layer wl-1">
          <svg class="wave-svg-top" viewBox="0 0 1000 120" preserveAspectRatio="none">
            <path d="M0,120 C150,15 320,105 500,35 C680,10 820,95 1000,25 L1000,120 L0,120 Z" />
          </svg>
          <div class="wave-solid-fill"></div>
          <svg class="wave-svg-bottom" viewBox="0 0 1000 120" preserveAspectRatio="none">
            <path d="M0,0 C150,105 320,15 500,85 C680,110 820,25 1000,95 L1000,0 L0,0 Z" />
          </svg>
        </div>

        <!-- Layer 2: Seafoam Emerald -->
        <div class="artafic-wave-layer wl-2">
          <svg class="wave-svg-top" viewBox="0 0 1000 120" preserveAspectRatio="none">
            <path d="M0,120 C180,30 360,5 520,75 C700,115 850,20 1000,60 L1000,120 L0,120 Z" />
          </svg>
          <div class="wave-solid-fill"></div>
          <svg class="wave-svg-bottom" viewBox="0 0 1000 120" preserveAspectRatio="none">
            <path d="M0,0 C180,90 360,115 520,45 C700,5 850,100 1000,60 L1000,0 L0,0 Z" />
          </svg>
        </div>

        <!-- Layer 3: ARTAFIC Electric Teal -->
        <div class="artafic-wave-layer wl-3">
          <svg class="wave-svg-top" viewBox="0 0 1000 120" preserveAspectRatio="none">
            <path d="M0,120 C130,20 310,95 490,40 C670,5 830,85 1000,15 L1000,120 L0,120 Z" />
          </svg>
          <div class="wave-solid-fill"></div>
          <svg class="wave-svg-bottom" viewBox="0 0 1000 120" preserveAspectRatio="none">
            <path d="M0,0 C130,100 310,25 490,80 C670,115 830,35 1000,105 L1000,0 L0,0 Z" />
          </svg>
        </div>

        <!-- Layer 4: Dark Ocean Base -->
        <div class="artafic-wave-layer wl-4">
          <svg class="wave-svg-top" viewBox="0 0 1000 120" preserveAspectRatio="none">
            <path d="M0,120 C200,45 380,20 540,70 C700,20 860,80 1000,30 L1000,120 L0,120 Z" />
          </svg>
          <div class="wave-solid-fill"></div>
          <svg class="wave-svg-bottom" viewBox="0 0 1000 120" preserveAspectRatio="none">
            <path d="M0,0 C200,75 380,100 540,50 C700,100 860,40 1000,90 L1000,0 L0,0 Z" />
          </svg>
        </div>

        <!-- Centered Destination Page Title -->
        <div class="artafic-transition-title-wrap" id="artafic-transition-title-wrap">
          <span class="artafic-transition-subtitle">ARTAFIC</span>
          <h2 class="artafic-transition-title" id="artafic-transition-title">PAGE</h2>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  const HOMEPAGE_SECTIONS = new Set([
    'home',
    'services',
    'before-after',
    'portfolio',
    'how-we-work',
    'process',
    'booking',
    'problem',
    'marquee',
    'value-strip'
  ]);

  function isCurrentPageHome() {
    const p = (window.location.pathname || '').toLowerCase();
    return p === '/' || p.endsWith('/index.html') || p.endsWith('/') || !p;
  }

  function getPageKey(urlString) {
    try {
      const url = new URL(urlString, window.location.href);
      const p = (url.pathname || '').toLowerCase();
      if (p.endsWith('/about') || p.endsWith('/about.html')) return 'about';
      if (p.endsWith('/faq') || p.endsWith('/faq.html')) return 'faq';
      if (p.endsWith('/privacy') || p.endsWith('/privacy.html')) return 'privacy';
      if (p.endsWith('/terms') || p.endsWith('/terms.html')) return 'terms';
      if (p === '/' || p.endsWith('/index.html') || p.endsWith('/') || !p) return 'home';
    } catch (e) {}
    return '';
  }

  function parseHomepageSection(href, linkEl) {
    if (linkEl && linkEl.dataset && linkEl.dataset.section) {
      let sec = linkEl.dataset.section.trim().toLowerCase();
      if (sec === 'contact') sec = 'booking';
      if (sec === 'process') sec = 'how-we-work';
      if (HOMEPAGE_SECTIONS.has(sec)) return sec;
    }

    if (!href) return null;
    const lowerHref = href.trim().toLowerCase();

    // Home link checks
    if (lowerHref === '/' || lowerHref === 'index.html' || lowerHref === '/index.html' || lowerHref === '#home' || lowerHref === '#') {
      if (linkEl && (linkEl.classList.contains('nav__logo') || linkEl.classList.contains('footer__brand-logo') || linkEl.querySelector('img.nav__logo-image'))) {
        return 'home';
      }
      const text = linkEl ? linkEl.textContent.trim().toLowerCase() : '';
      if (text === 'home') return 'home';
    }

    // Extract hash if any
    let hash = '';
    if (lowerHref.includes('#')) {
      hash = lowerHref.split('#')[1].split('?')[0];
    } else if (lowerHref.startsWith('#')) {
      hash = lowerHref.slice(1).split('?')[0];
    }

    if (hash) {
      if (hash === 'contact' || hash === 'booking') hash = 'booking';
      if (hash === 'process' || hash === 'how-we-work') hash = 'how-we-work';
      if (HOMEPAGE_SECTIONS.has(hash)) return hash;
    }

    return null;
  }

  function getDestinationLabel(linkElement, href) {
    const text = (linkElement ? linkElement.textContent.trim() : '').toUpperCase();
    const lowerHref = (href || '').toLowerCase();

    if (lowerHref.includes('about') || text.includes('ABOUT')) return 'ABOUT';
    if (lowerHref.includes('services') || text.includes('SERVICES')) return 'SERVICES';
    if (lowerHref.includes('faq') || text.includes('FAQ')) return 'FAQ';
    if (lowerHref.includes('privacy') || text.includes('PRIVACY')) return 'PRIVACY POLICY';
    if (lowerHref.includes('terms') || text.includes('TERMS')) return 'TERMS OF SERVICE';
    if (lowerHref.includes('why-artafic') || text.includes('WHY')) return 'WHY ARTAFIC';
    if (lowerHref.includes('before-after') || text.includes('BEFORE')) return 'BEFORE & AFTER';
    if (lowerHref.includes('how-we-work') || lowerHref.includes('process') || text.includes('HOW WE WORK')) return 'HOW WE WORK';
    if (lowerHref.includes('portfolio') || text.includes('WORK') || text.includes('PORTFOLIO')) return 'SELECTED WORK';
    if (lowerHref.includes('booking') || text.includes('TOUCH') || text.includes('BOOK')) return 'GET IN TOUCH';
    if (lowerHref.includes('home') || lowerHref === '/' || lowerHref.endsWith('/index.html') || text === 'HOME') return 'HOME';

    if (text && text.length < 25 && !text.includes('\n')) return text;
    return 'ARTAFIC';
  }

  function closeMobileMenu() {
    if (typeof window.closeMobileMenu === 'function') {
      window.closeMobileMenu();
      return;
    }
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburger = document.getElementById('hamburger');
    if (mobileMenu && mobileMenu.classList.contains('is-open')) {
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      if (hamburger) {
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    }
    document.body.style.overflow = '';
  }

  function safePushState(pushUrl) {
    if (window.location.protocol === 'file:') return;
    try {
      window.history.pushState(null, '', pushUrl);
    } catch (e) {}
  }

  function triggerSectionAnimations(targetEl, sectionId) {
    if (!targetEl) return;

    // 1. Services SVG stroke and camera pan follow scroll
    if (sectionId === 'services' || targetEl.id === 'services') {
      if (typeof window.initServicesStrokeFollowScroll === 'function') {
        window.initServicesStrokeFollowScroll();
      }
    }

    // 2. Animate reveal elements inside target section
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealElements = targetEl.querySelectorAll('[data-reveal], .fade-up, .reveal-text-inner');

    if (revealElements.length > 0) {
      if (prefersReducedMotion) {
        revealElements.forEach(el => el.classList.add('is-visible', 'is-revealed'));
      } else {
        // Reset classes to trigger entrance transition
        revealElements.forEach(el => el.classList.remove('is-visible', 'is-revealed'));
        setTimeout(() => {
          revealElements.forEach((el, idx) => {
            const delayAttr = el.getAttribute('data-reveal-delay');
            const delayMs = delayAttr ? parseInt(delayAttr, 10) * 60 : Math.min(idx * 70, 400);
            setTimeout(() => {
              el.classList.add('is-visible', 'is-revealed');
            }, delayMs);
          });
        }, 80);
      }
    }

    // 3. Dispatch scroll events so dynamic scroll effects sync
    window.dispatchEvent(new Event('scroll'));
    [150, 350, 650, 950].forEach(delay => {
      setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
      }, delay);
    });
  }

  function scrollToSection(sectionId, behavior = 'smooth') {
    if (!sectionId || sectionId === 'home') {
      window.scrollTo({ top: 0, behavior });
      safePushState(window.location.protocol === 'file:' ? window.location.pathname : '/');
      if (typeof window.updateActiveNavLinks === 'function') window.updateActiveNavLinks('/');
      return true;
    }

    let targetEl = document.getElementById(sectionId);
    if (!targetEl && (sectionId === 'how-we-work' || sectionId === 'process')) {
      targetEl = document.getElementById('how-we-work') || document.getElementById('process') || document.getElementById('our-approach');
    }
    if (!targetEl && (sectionId === 'booking' || sectionId === 'contact')) {
      targetEl = document.getElementById('booking') || document.getElementById('contact');
    }

    if (targetEl) {
      const navH = document.getElementById('nav')?.offsetHeight || 72;
      const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top: Math.max(0, targetTop), behavior });
      triggerSectionAnimations(targetEl, sectionId);
      // Guarantee URL stays clean without hash
      safePushState(window.location.protocol === 'file:' ? window.location.pathname : '/');
      return true;
    }
    return false;
  }

  window.updateActiveNavLinks = function(targetUrlString) {
    try {
      const currentPageKey = getPageKey(targetUrlString || window.location.href);

      document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        const linkPageKey = getPageKey(href);
        const sectionAttr = link.getAttribute('data-section');

        link.classList.remove('nav__link--active', 'is-active');
        link.style.color = '';
        link.style.fontWeight = '';

        if (currentPageKey === 'about' && (linkPageKey === 'about' || href.includes('about'))) {
          link.classList.add('nav__link--active');
          link.style.color = 'var(--color-teal)';
          link.style.fontWeight = '600';
        } else if (currentPageKey === 'faq' && (linkPageKey === 'faq' || href.includes('faq'))) {
          link.classList.add('nav__link--active');
          link.style.color = 'var(--color-teal)';
          link.style.fontWeight = '600';
        } else if (currentPageKey === 'home') {
          if (sectionAttr === 'home' || href === 'index.html' || href === '/' || href === '#home') {
            link.classList.add('nav__link--active', 'is-active');
          }
        }
      });
    } catch (e) {}
  };

  function normalizeUrl(urlString) {
    try {
      const url = new URL(urlString, window.location.href);
      if (window.location.protocol !== 'file:' && url.origin === window.location.origin) {
        let cleanPath = url.pathname.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
        if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
        if (cleanPath.length > 1 && cleanPath.endsWith('/')) cleanPath = cleanPath.slice(0, -1);
        url.pathname = cleanPath;
        if (cleanPath === '/' && (url.hash === '#home' || url.hash === '#')) {
          url.hash = '';
        }
      }
      return url;
    } catch (e) {
      return new URL(urlString, window.location.href);
    }
  }

  let isTransitionRunning = false;

  function runPageTransition(targetUrlString, labelText, targetSectionId) {
    if (isTransitionRunning) return;

    if (window.location.protocol === 'file:') {
      if (targetSectionId) {
        try { sessionStorage.setItem('artafic_scroll_target', targetSectionId); } catch(e) {}
      }
      window.location.href = targetUrlString;
      return;
    }

    isTransitionRunning = true;

    const overlay = ensureOverlay();
    const titleWrap = document.getElementById('artafic-transition-title-wrap');
    const titleEl = document.getElementById('artafic-transition-title');

    if (titleEl) titleEl.textContent = labelText || 'ARTAFIC';
    if (titleWrap) titleWrap.className = 'artafic-transition-title-wrap';

    closeMobileMenu();

    overlay.className = 'artafic-transition-overlay is-visible is-active';
    void overlay.offsetWidth;

    setTimeout(() => {
      overlay.classList.add('is-entering');
    }, 20);

    const currentUrl = normalizeUrl(window.location.href);
    const targetUrl = normalizeUrl(targetUrlString);
    const isSamePage = currentUrl.origin === targetUrl.origin && currentUrl.pathname === targetUrl.pathname;

    let fetchUrl = targetUrl.pathname;
    if (fetchUrl === '/') fetchUrl = '/index.html';

    const fetchPromise = !isSamePage
      ? fetch(fetchUrl)
          .catch(() => fetch(targetUrl.pathname))
          .then(r => {
            if (!r.ok) throw new Error('Fetch failed with status ' + r.status);
            return r.text();
          })
      : Promise.resolve(null);

    const MIN_ENTER_HOLD = 1000;

    setTimeout(() => {
      if (titleWrap) titleWrap.classList.add('is-visible');

      fetchPromise.then(html => {
        if (html) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          document.title = doc.title;
          document.body.className = doc.body.className;

          doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            const baseHref = href.split('?')[0];
            const existing = document.querySelector(`link[href^="${baseHref}"]`);
            if (existing) {
              if (existing.getAttribute('href') !== href) {
                existing.setAttribute('href', href);
              }
            } else {
              const newLink = document.createElement('link');
              newLink.rel = 'stylesheet';
              newLink.href = href;
              document.head.appendChild(newLink);
            }
          });

          const currentMain = document.getElementById('main-content');
          const newMain = doc.getElementById('main-content');
          if (currentMain && newMain) {
            currentMain.innerHTML = newMain.innerHTML;
            currentMain.className = newMain.className;
          }

          // CLEAN ROUTE PUSH - NEVER PUSH HASH!
          const cleanPushUrl = targetUrl.pathname === '/' || targetUrl.pathname.endsWith('/index.html') ? '/' : targetUrl.pathname;
          safePushState(cleanPushUrl);

          // Update active navigation indicators
          window.updateActiveNavLinks(cleanPushUrl);

          // Re-initialize scripts for swapped content
          if (typeof window.reinitPageScripts === 'function') {
            window.reinitPageScripts(cleanPushUrl);
          }

          // Position at destination while overlay is still covering
          if (targetSectionId && targetSectionId !== 'home') {
            scrollToSection(targetSectionId, 'instant');
          } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
        } else if (targetSectionId && targetSectionId !== 'home') {
          scrollToSection(targetSectionId, 'instant');
          safePushState('/');
        }

        // Hold label visible for 350ms, then exit overlay
        setTimeout(() => {
          if (titleWrap) {
            titleWrap.classList.remove('is-visible');
            titleWrap.classList.add('is-fading');
          }

          setTimeout(() => {
            overlay.className = 'artafic-transition-overlay is-visible is-exiting is-active';

            // Trigger animations as the veil lifts
            if (targetSectionId && targetSectionId !== 'home') {
              const targetEl = document.getElementById(targetSectionId);
              triggerSectionAnimations(targetEl, targetSectionId);
            }

            setTimeout(() => {
              overlay.className = 'artafic-transition-overlay';
              if (titleWrap) titleWrap.className = 'artafic-transition-title-wrap';
              isTransitionRunning = false;
            }, 1050);
          }, 180);
        }, 350);

      }).catch(err => {
        console.error('Fetch transition error, fallback to native:', err);
        window.location.href = targetUrl.href;
      });

    }, MIN_ENTER_HOLD);
  }

  // Intercept all navigation clicks globally
  document.addEventListener('click', function(e) {
    const target = e.target.closest('a');
    if (!target) return;

    const href = target.getAttribute('href');
    if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    // 1. CHECK IF TARGETS A HOMEPAGE SECTION
    const targetSectionId = parseHomepageSection(href, target);

    if (targetSectionId) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeMobileMenu();

      if (isCurrentPageHome()) {
        // ALREADY ON HOMEPAGE: Smooth scroll & animate, URL stays clean '/'
        scrollToSection(targetSectionId, 'smooth');
        return;
      } else {
        // ON SUBPAGE (/about or /faq): SPA page transition back to homepage
        const label = getDestinationLabel(target, href);
        runPageTransition('/', label, targetSectionId);
        return;
      }
    }

    // 2. CHECK DEDICATED SUBPAGES (/about, /faq, etc.)
    if (window.location.protocol === 'file:') {
      closeMobileMenu();
      return;
    }

    let currentUrl, targetUrl;
    try {
      currentUrl = normalizeUrl(window.location.href);
      targetUrl = normalizeUrl(href);
    } catch (err) {
      return;
    }

    if (targetUrl.origin !== currentUrl.origin) return;

    const isSamePath = targetUrl.pathname === currentUrl.pathname;

    if (isSamePath) {
      // Clicking same page (e.g. clicking About while on /about)
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Cross-page route transition (e.g. /about -> /faq or / -> /about)
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    closeMobileMenu();

    const label = getDestinationLabel(target, href);
    runPageTransition(targetUrl.href, label, null);
  }, true);

  // Handle Browser Back / Forward buttons
  window.addEventListener('popstate', () => {
    if (window.location.protocol === 'file:') return;
    const url = normalizeUrl(window.location.href);
    const label = getDestinationLabel(null, url.href);
    runPageTransition(url.href, label, null);
  });

  // Handle Initial Load with Hash or Session Scroll Target
  window.addEventListener('DOMContentLoaded', () => {
    let initialTarget = null;
    try {
      initialTarget = sessionStorage.getItem('artafic_scroll_target');
      if (initialTarget) sessionStorage.removeItem('artafic_scroll_target');
    } catch(e) {}

    if (!initialTarget && window.location.hash) {
      initialTarget = window.location.hash.slice(1);
    }

    if (initialTarget) {
      // Immediately clean URL of any hash
      safePushState(window.location.protocol === 'file:' ? window.location.pathname : '/');
      setTimeout(() => {
        scrollToSection(initialTarget, 'smooth');
      }, 150);
    }
  });

  // Global test function
  window.testArtaficTransition = function(customLabel) {
    runPageTransition(window.location.href, customLabel || 'ARTAFIC', null);
  };
})();

/* ============================================================
   33. ARTAFIC MINIMAL BRANDED LOADER (SelfMadeSystem Engine)
   ============================================================ */
function initArtaficLoader() {
  const overlay = document.getElementById('artafic-loader') || document.querySelector('.artafic-loading-overlay');
  if (!overlay) return;

  const isPreview = window.location.search.includes('loader') || window.location.hash.includes('loader');

  function dismiss() {
    if (isPreview) return;
    if (overlay.classList.contains('artafic-loading-overlay--hidden')) return;
    overlay.classList.add('artafic-loading-overlay--hidden');
    setTimeout(() => {
      if (overlay && overlay.parentNode) {
        overlay.style.display = 'none';
      }
    }, 300);
  }

  // Allow clicking the overlay during preview or test to dismiss
  overlay.addEventListener('click', () => {
    overlay.classList.add('artafic-loading-overlay--hidden');
    setTimeout(() => { if (overlay) overlay.style.display = 'none'; }, 300);
  });

  // Guarantees at least 2200ms of display time so the SelfMadeSystem
  // stroke animation is visibly watchable before smooth dismissal.
  const startTime = Date.now();
  const MIN_DISPLAY_MS = 2200;

  function onReady() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
    setTimeout(dismiss, remaining);
  }

  if (document.readyState === 'complete') {
    onReady();
  } else {
    window.addEventListener('load', onReady, { once: true });
    // Failsafe in case a heavy external asset stalls
    setTimeout(onReady, 4000);
  }
}

window.showArtaficLoader = function() {
  const overlay = document.getElementById('artafic-loader') || document.querySelector('.artafic-loading-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  overlay.classList.remove('artafic-loading-overlay--hidden');
};

window.dismissArtaficLoader = function() {
  const overlay = document.getElementById('artafic-loader') || document.querySelector('.artafic-loading-overlay');
  if (!overlay) return;
  overlay.classList.add('artafic-loading-overlay--hidden');
  setTimeout(() => { if (overlay) overlay.style.display = 'none'; }, 300);
};

window.initArtaficLoader = initArtaficLoader;
initArtaficLoader();

