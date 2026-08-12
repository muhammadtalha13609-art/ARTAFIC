/* ============================================================
   ARTAFIC — Main JavaScript
   Version: 1.0.0
   ============================================================ */

'use strict';

/* ────────────────────────────────────────────────────────────
   UTILITIES
   ──────────────────────────────────────────────────────────── */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ────────────────────────────────────────────────────────────
   01. NAVIGATION — Scroll-aware sticky nav
   ──────────────────────────────────────────────────────────── */
(function initNav() {
  const nav = $('#nav');
  if (!nav) return;

  const darkSections = $$('#home, #marquee, #about');

  function updateNavState() {
    const scrollY = window.scrollY;
    
    if (scrollY > 20) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }

    // Check if navbar overlaps any dark section
    const navBounds = nav.getBoundingClientRect();
    const navCenterY = navBounds.top + navBounds.height / 2;
    
    let isOverDark = false;
    for (const sec of darkSections) {
      const rect = sec.getBoundingClientRect();
      if (navCenterY >= rect.top && navCenterY <= rect.bottom) {
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

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateNavState);
  }, { passive: true });

  window.addEventListener('resize', updateNavState, { passive: true });
  updateNavState();
})();


/* ────────────────────────────────────────────────────────────
   02. MOBILE MENU
   ──────────────────────────────────────────────────────────── */
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
  $$('[data-mobile-nav-link]').forEach(link => {
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
})();


/* ────────────────────────────────────────────────────────────
   03. SMOOTH ANCHOR SCROLLING
   ──────────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href').slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    const offset = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
})();


/* ────────────────────────────────────────────────────────────
   04. SCROLL REVEAL (IntersectionObserver)
   ──────────────────────────────────────────────────────────── */
(function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    $$('[data-reveal]').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  $$('[data-reveal]').forEach(el => observer.observe(el));
})();


/* ────────────────────────────────────────────────────────────
   05. BEFORE / AFTER SLIDER — HIGH PERFORMANCE TOUCH TRACKING
   ──────────────────────────────────────────────────────────── */
(function initSlider() {
  const container = $('#slider-container');
  if (!container) return;

  const before = $('#slider-before');
  const divider = $('#slider-divider');
  const handle = $('#slider-handle');

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
})();


/* ────────────────────────────────────────────────────────────
   06. FAQ ACCORDION — CONTENT-AWARE ACCORDION EXPANSION
   ──────────────────────────────────────────────────────────── */
(function initAccordion() {
  const accordion = $('#faq-accordion');
  if (!accordion) return;

  const items = $$('.faq-item', accordion);

  items.forEach(item => {
    const trigger = item.querySelector('.faq-item__trigger');
    const body = item.querySelector('.faq-item__body');

    trigger.addEventListener('click', () => {
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
      trigger.setAttribute('aria-expanded', String(!isOpen));

      if (!isOpen && body) {
        body.style.maxHeight = body.scrollHeight + 'px';
      } else if (body) {
        body.style.maxHeight = '0px';
      }
    });

    // Keyboard support
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });
})();


/* ────────────────────────────────────────────────────────────
   07. BOOKING FORM VALIDATION
   ──────────────────────────────────────────────────────────── */
(function initBookingForm() {
  const form = $('#booking-form');
  const successEl = $('#booking-success');
  if (!form) return;

  const fields = [
    { id: 'field-name',    errorId: 'error-name',    validate: v => v.trim().length >= 2 },
    { id: 'field-email',   errorId: 'error-email',   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    { id: 'field-service', errorId: 'error-service', validate: v => v !== '' }
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

    // Success
    const submitBtn = $('#form-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    // Simulate async submission
    setTimeout(() => {
      form.style.display = 'none';
      successEl.classList.add('is-visible');
      successEl.focus();
    }, 800);
  });
})();


/* ────────────────────────────────────────────────────────────
   08. CHATBOT
   ──────────────────────────────────────────────────────────── */
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

  // ─── FAQ Knowledge Base ───────────────────────────────────
  const faqAnswers = {
    services: {
      text: 'ARTAFIC offers two focused services:\n\n**Web Development** — Professional, responsive websites built around your business goals, customer behavior, and conversion.\n\n**Logo Building** — Custom logo design that gives your business a cleaner, more professional visual identity.\n\nWe deliberately keep our focus narrow to ensure quality in both areas.',
      cta: true
    },
    process: {
      text: 'Our process has four stages:\n\n**01 — Understand:** We learn about your business, audience, and goals.\n\n**02 — Design:** We create a clear visual and UX direction aligned to those goals.\n\n**03 — Build:** We develop the responsive website from the approved design.\n\n**04 — Refine:** We test, review, and polish before delivery.\n\nEach stage includes your review and approval.',
      cta: true
    },
    cost: {
      text: 'Project pricing is based on scope, requirements, complexity, and your business goals. We don\'t publish fixed packages because no two projects are the same.\n\nThe right approach is a conversation — get in touch and we can discuss your project and provide a proper estimate.',
      cta: true
    },
    timeline: {
      text: 'Timeline depends on the scope and complexity of your project. Every project is different.\n\nThe most accurate way to get a timeline is to get in touch so we can understand your specific requirements and give you a realistic estimate based on what the work actually involves.',
      cta: true
    },
    redesign: {
      text: 'Yes. Redesigning an existing website is one of the most common types of projects we work on.\n\nIf your current site is outdated, underperforming, or no longer reflects your business properly, we can redesign it from the ground up — keeping what works and replacing what doesn\'t.',
      cta: true
    },
    booking: {
      text: 'Getting in touch is simple — scroll down to the "Get In Touch" section on this page, or click the "Get In Touch" button in the navigation.\n\nFill in the simple form with your details and we\'ll review your inquiry and reach out promptly.',
      cta: true
    }
  };

  // Fallback for unrecognized messages
  function getFallbackAnswer(message) {
    const lower = message.toLowerCase();

    if (lower.includes('service') || lower.includes('offer') || lower.includes('do you do')) {
      return faqAnswers.services;
    }
    if (lower.includes('process') || lower.includes('work') || lower.includes('how')) {
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
    if (lower.includes('book') || lower.includes('meeting') || lower.includes('contact') || lower.includes('touch') || lower.includes('start')) {
      return faqAnswers.booking;
    }

    return {
      text: 'That\'s a great question. To give you the most accurate information for your specific situation, the best next step is to get in touch with us directly. We\'ll be happy to address your question in full.',
      cta: true
    };
  }

  // ─── Message Rendering ───────────────────────────────────
  function renderMessage(text, type = 'bot', hasCta = false) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message chat-message--${type}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-message__avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = type === 'bot' ? 'A' : 'Y';

    const body = document.createElement('div');
    body.className = 'chat-message__body';

    const bubble = document.createElement('div');
    bubble.className = 'chat-message__bubble';

    // Convert basic markdown-like **bold** to <strong>
    const formattedText = text
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

  // ─── Open / Close ─────────────────────────────────────────
  function openPanel() {
    isOpen = true;
    launcherBtn.classList.add('is-open');
    panel.classList.add('is-open');
    launcherBtn.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');

    if (badge) badge.style.display = 'none';

    if (!greetingShown) {
      greetingShown = true;
      renderMessage('Hi there 👋 I\'m the ARTAFIC assistant.\n\nI can answer questions about our services, process, and pricing. What would you like to know?', 'bot', false);
    }

    setTimeout(() => input.focus(), 300);
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

  // ─── Predefined Suggestion Buttons ───────────────────────
  $$('.chatbot-panel__suggestion', suggestionsEl).forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.question;
      renderMessage(btn.textContent, 'user');
      await botReply(faqAnswers[key] || getFallbackAnswer(btn.textContent));
    });
  });

  // ─── User Input ───────────────────────────────────────────
  async function handleUserMessage() {
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    renderMessage(message, 'user');

    const answer = getFallbackAnswer(message);
    await botReply(answer);
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
(function initScrollSpy() {
  const navLinks = $$('[data-nav-link]');
  const sectionIds = ['home', 'services', 'about', 'why-artafic', 'before-after', 'faq'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  const navHeight = 80;

  function updateActive() {
    let current = '';

    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top <= navHeight + 40) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').slice(1);
      link.classList.toggle('is-active', href === current);
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();


/* ────────────────────────────────────────────────────────────
   10A. HERO 3D SCENE — Three.js via ESM CDN
   ──────────────────────────────────────────────────────────── */
(async function initHeroThree() {
  const canvas = document.getElementById('aether-canvas') || document.getElementById('hero-three');
  if (!canvas) return;

  // Skip on reduced-motion or if WebGL not supported
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.WebGLRenderingContext) return;

  // ── Dynamically load Three.js from ESM CDN (no npm needed) ──
  let THREE;
  try {
    THREE = await import('https://esm.sh/three@0.163.0');
  } catch (e) {
    console.warn('Three.js failed to load:', e);
    return;
  }

  // ── Renderer ──
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,          // transparent bg — particle canvas shows behind
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);  // fully transparent clear

  // ── Scene & Camera ──
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  // ── Teal colour palette ──
  const TEAL       = 0x14b8a6;
  const TEAL_LIGHT = 0x5eead4;
  const TEAL_DARK  = 0x0d9488;

  // ── Main object: Torus Knot ──
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

  // ── Secondary object: Icosahedron orbiting the knot ──
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

  // ── Third object: Octahedron — left side ──
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

  // ── Lights ──
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(TEAL, 3, 12);
  pointLight1.position.set(3, 3, 3);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(TEAL_LIGHT, 2, 10);
  pointLight2.position.set(-3, -2, 2);
  scene.add(pointLight2);

  // ── Mouse tracking for camera drift ──
  const mouse3d = { x: 0, y: 0 };
  const mouseLerped = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse3d.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse3d.y = (e.clientY / window.innerHeight - 0.5) * -2;
  }, { passive: true });

  // ── Resize ──
  function resizeThree() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  window.addEventListener('resize', resizeThree, { passive: true });

  // ── Animation loop ──
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


/* ────────────────────────────────────────────────────────────
   10. HERO AETHERFLOW INTERACTIVE PARTICLE CANVAS
   ──────────────────────────────────────────────────────────── */
(function initHeroCanvas() {
  const canvas = document.getElementById('aether-canvas') || document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  const mouse = { x: null, y: null, radius: 180 };

  /* ── Particle Class ── */
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

/* ────────────────────────────────────────────────────────────
   10. ABOUT SECTION SCROLL TEXT REVEAL & MAGNETIC HOVER
   ──────────────────────────────────────────────────────────── */
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
/* ────────────────────────────────────────────────────────────
   12. FULL-SCREEN SCROLL STORYTELLING ENGINE
   ──────────────────────────────────────────────────────────── */
(function initTimeline() {
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
        const startX = (isLeft && !isMobile) ? -100 : 100;
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
        const numStartX  = (isLeft && !isMobile) ? -100 : 100;
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
})();

/* ------------------------------------------------------------
   13. MARQUEE SCROLL ANIMATION
   ------------------------------------------------------------ */

(function initMarquee() {
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

    requestAnimationFrame(loop);
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
})();

/* ------------------------------------------------------------
   14. AETHER CANVAS ANIMATION
   ------------------------------------------------------------ */
(function initAetherCanvas() {
  const canvas = document.getElementById('aether-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

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
    animationFrameId = requestAnimationFrame(animate);
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
})();

/* ------------------------------------------------------------
   15. SVG PATH MARQUEE ANIMATION (Pixel-Perfect Path & Scroll Velocity Drive)
   ------------------------------------------------------------ */
(function initSvgPathMarquee() {
  const container = document.getElementById('svg-path-marquee');
  const path = document.getElementById('marquee-svg-path');
  const itemsLayer = document.getElementById('svg-marquee-items');

  if (!container || !path || !itemsLayer) return;

  const imgs = [
    "https://cdn.cosmos.so/b9909337-7a53-48bc-9672-33fbd0f040a1?format=jpeg",
    "https://cdn.cosmos.so/ecdc9dd7-2862-4c28-abb1-dcc0947390f3?format=jpeg",
    "https://cdn.cosmos.so/79de41ec-baa4-4ac0-a9a4-c090005ca640?format=jpeg",
    "https://cdn.cosmos.so/1a18b312-21cd-4484-bce5-9fb7ed1c5e01?format=jpeg",
    "https://cdn.cosmos.so/d765f64f-7a66-462f-8b2d-3d7bc8d7db55?format=jpeg",
    "https://cdn.cosmos.so/6b9f08ea-f0c5-471f-a620-71221ff1fb65?format=jpeg",
    "https://cdn.cosmos.so/40a09525-4b00-4666-86f0-3c45f5d77605?format=jpeg",
    "https://cdn.cosmos.so/14f05ab6-b4d0-4605-9007-8a2190a249d0?format=jpeg",
    "https://cdn.cosmos.so/d05009a2-a2f8-4a4c-a0de-e1b0379dddb8?format=jpeg",
    "https://cdn.cosmos.so/ba646e35-efc2-494a-961b-b40f597e6fc9?format=jpeg",
    "https://cdn.cosmos.so/e899f9c3-ed48-4899-8c16-fbd5a60705da?format=jpeg",
    "https://cdn.cosmos.so/24e83c11-c607-45cd-88fb-5059960b56a0?format=jpeg",
    "https://cdn.cosmos.so/cd346bce-f415-4ea7-8060-99c5f7c1741a?format=jpeg"
  ];

  // Render DOM nodes inside itemsLayer
  const nodes = imgs.map((src, i) => {
    const el = document.createElement('div');
    el.className = 'svg-marquee-item';
    el.innerHTML = `<img src="${src}" alt="Showcase preview ${i+1}" loading="lazy" decoding="async" />`;
    itemsLayer.appendChild(el);
    return el;
  });

  const totalLength = path.getTotalLength();
  let baseProgress = 0;
  let scrollVelocity = 0;
  let lastScrollY = window.scrollY;
  let isHovered = false;

  function updatePositions() {
    const containerWidth = itemsLayer.clientWidth || 1040;
    const containerHeight = itemsLayer.clientHeight || 570;
    const count = imgs.length;

    nodes.forEach((node, i) => {
      let progress = ((i / count) * 100 + baseProgress) % 100;
      if (progress < 0) progress += 100;

      // Get exact point along path (viewBox dimensions 1040 x 570)
      const point = path.getPointAtLength((progress / 100) * totalLength);

      // Convert SVG viewBox coordinates to container pixel bounds
      const pixelX = (point.x / 1040) * containerWidth;
      const pixelY = (point.y / 570) * containerHeight;

      // Dynamic z-index based on vertical path position for depth
      const zIndex = Math.round(point.y);

      node.style.transform = `translate3d(${pixelX.toFixed(2)}px, ${pixelY.toFixed(2)}px, 0) translate(-50%, -50%)`;
      node.style.zIndex = String(zIndex);
    });
  }

  // Track page scroll speed and direction to drive path marquee motion
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    scrollVelocity += delta * 0.025;
    lastScrollY = currentScrollY;
    updatePositions();
  }, { passive: true });

  // Hover slowdown
  container.addEventListener('mouseenter', () => { isHovered = true; });
  container.addEventListener('mouseleave', () => { isHovered = false; });

  // Drag interaction along path
  let isDragging = false;
  let startX = 0;

  itemsLayer.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    itemsLayer.style.cursor = 'grabbing';
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    startX = e.clientX;
    baseProgress += (deltaX / (itemsLayer.clientWidth || 1000)) * 40;
    updatePositions();
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
    itemsLayer.style.cursor = 'grab';
  });

  window.addEventListener('resize', updatePositions);

  let isVisible = false;
  let animId = null;

  function animate() {
    if (isVisible) {
      // Continuous base speed + scroll velocity decay
      const speed = isHovered ? 0.015 : 0.045;
      scrollVelocity *= 0.90; // Smooth damping
      baseProgress += speed + scrollVelocity;
      updatePositions();
    }
    animId = requestAnimationFrame(animate);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animId) {
        animId = requestAnimationFrame(animate);
      }
    });
  }, { rootMargin: '200px 0px' });

  observer.observe(container);
  updatePositions();
  animId = requestAnimationFrame(animate);
})();

/* ------------------------------------------------------------
   16. SERVICES SVG STROKE FOLLOW SCROLL & ENDPOINT CARD ANIMATION
   ------------------------------------------------------------ */
(function initServicesStrokeFollowScroll() {
  const container = document.getElementById('services');
  const path = document.getElementById('services-scroll-path');
  const endpointCard = document.getElementById('services-endpoint-card');

  if (!container || !path) return;

  const pathLength = path.getTotalLength();
  path.style.strokeDasharray = `${pathLength} ${pathLength}`;
  path.style.strokeDashoffset = `${pathLength}`;

  function updateStrokeAndCard() {
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress between 0 and 1 as section moves through viewport
    const totalDist = rect.height;
    const currentDist = windowHeight - rect.top;
    const progress = Math.max(0, Math.min(1, currentDist / (totalDist + windowHeight * 0.5)));

    // Draw stroke along path
    const drawLength = pathLength * Math.min(1, progress * 1.2);
    path.style.strokeDashoffset = `${pathLength - drawLength}`;

    // Translate endpoint card up smoothly as scroll reaches the end of the stroke
    if (endpointCard) {
      const cardTranslateProgress = Math.max(0, Math.min(1, (progress - 0.25) / 0.75));
      const translateY = (1 - cardTranslateProgress) * 120; // 120px to 0px
      const opacity = Math.min(1, cardTranslateProgress * 1.5);

      endpointCard.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
      endpointCard.style.opacity = String(opacity.toFixed(2));
    }
  }

  window.addEventListener('scroll', updateStrokeAndCard, { passive: true });
  window.addEventListener('resize', updateStrokeAndCard, { passive: true });
  updateStrokeAndCard();
})();
