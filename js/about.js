/**
 * ARTAFIC — About Page Interactive Engine v2.2 (UI/UX Pro Max Engine)
 * Motion-Driven Editorial System & Preserved Signature Animation
 */
(function initAboutExperience() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Floating Paths SVG Generator
  function createPathsSVG(position, themeMode) {
    let paths = '';
    const isMobile = window.innerWidth < 768;
    const numPaths = isMobile ? 18 : 36;
    
    for (let i = 0; i < numPaths; i++) {
      const mX = -(380 - i * 5 * position);
      const mY = -(189 + i * 6);
      const c1X = -(380 - i * 5 * position);
      const c1Y = -(189 + i * 6);
      const c2X = -(312 - i * 5 * position);
      const c2Y = (216 - i * 6);
      const c3X = (152 - i * 5 * position);
      const c3Y = (343 - i * 6);
      const c4X = (616 - i * 5 * position);
      const c4Y = (470 - i * 6);
      const c5X = (684 - i * 5 * position);
      const c5Y = (875 - i * 6);
      const c6X = (684 - i * 5 * position);
      const c6Y = (875 - i * 6);

      const d = `M${mX} ${mY}C${c1X} ${c1Y} ${c2X} ${c2Y} ${c3X} ${c3Y}C${c4X} ${c4Y} ${c5X} ${c5Y} ${c6X} ${c6Y}`;
      
      let color;
      if (themeMode === 'heavy') {
        color = Math.random() < 0.2 ? `rgba(20, 184, 166, ${0.1 + i * 0.015})` : `rgba(255, 255, 255, ${0.03 + i * 0.005})`;
      } else if (themeMode === 'minimal') {
        color = `rgba(255, 255, 255, ${0.02 + i * 0.002})`;
      } else {
        color = Math.random() < 0.05 ? `rgba(20, 184, 166, ${0.05 + i * 0.01})` : `rgba(255, 255, 255, ${0.02 + i * 0.005})`;
      }
      
      const width = 0.5 + i * 0.03;
      const duration = 20 + Math.random() * 10;
      const delay = -Math.random() * 20;
      
      paths += `<path d="${d}" stroke="${color}" stroke-width="${width}" fill="none" class="fp-path" style="animation-duration: ${duration}s; animation-delay: ${delay}s;" />`;
    }
    return `<svg class="fp-svg" viewBox="0 0 696 316" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${paths}</svg>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    
    // Inject Floating Paths SVG
    document.querySelectorAll('.floating-paths-bg').forEach(container => {
      const pos = parseFloat(container.dataset.pos || '1');
      const theme = container.dataset.theme || 'normal';
      container.innerHTML = createPathsSVG(pos, theme);
    });

    // 2. Initial Page Intro Staggered Reveals
    setTimeout(() => {
      document.querySelectorAll('.about-intro .reveal-text-inner, .about-intro .fade-up').forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('is-revealed');
        }, index * 100);
      });
    }, 100);

    // Scroll Prompt Button Click Handler
    const scrollPrompt = document.getElementById('scroll-prompt');
    if (scrollPrompt) {
      scrollPrompt.addEventListener('click', () => {
        const nextSec = document.getElementById('why-exists');
        if (nextSec) {
          nextSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // 3. Staggered Scroll Reveal Observer
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0.1 });

    document.querySelectorAll('.reveal-text-inner:not(.about-intro *), .fade-up:not(.about-intro *)').forEach(el => {
      revealObserver.observe(el);
    });

    // 4. Story Active Item Observer
    const storyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          entry.target.classList.add('is-active');
        } else if (entry.intersectionRatio < 0.1) {
          entry.target.classList.remove('is-active');
        }
      });
    }, { rootMargin: '-10% 0px -30% 0px', threshold: [0.1, 0.4] });
    
    document.querySelectorAll('.story-item').forEach(el => storyObserver.observe(el));

    // 5. Beliefs Active Item Observer
    const beliefObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
        }
      });
    }, { rootMargin: '-10% 0px -20% 0px', threshold: 0.2 });
    
    document.querySelectorAll('.belief-card').forEach(el => beliefObserver.observe(el));

    // 6. Philosophy Sync & Click Handling
    const philTitles = document.querySelectorAll('.phil-title');
    const philCards = document.querySelectorAll('.phil-card-box');

    philTitles.forEach((t, i) => {
      t.addEventListener('click', () => {
        philTitles.forEach(title => title.classList.remove('is-active'));
        philCards.forEach(card => card.classList.remove('is-active'));
        t.classList.add('is-active');
        if (philCards[i]) {
          philCards[i].classList.add('is-active');
          philCards[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });

    const philObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          const idx = parseInt(entry.target.dataset.index || '0');
          philTitles.forEach((t, i) => t.classList.toggle('is-active', i === idx));
          philCards.forEach((c, i) => c.classList.toggle('is-active', i === idx));
        }
      });
    }, { rootMargin: '-30% 0px -30% 0px', threshold: [0.3, 0.6] });
    
    philCards.forEach(el => philObserver.observe(el));

    // 7. Scroll Engine (Why Exists Line & PRESERVED LESS NOISE ANIMATION)
    const whyExistsSec = document.getElementById('why-exists');
    const whyLineFill = document.querySelector('.why-exists__line-fill');
    const lessNoiseSec = document.getElementById('less-noise');
    const word1 = document.querySelector('.less-noise__word1');
    const word2 = document.querySelector('.less-noise__word2');
    const parallaxEls = document.querySelectorAll('[data-parallax]');

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const winH = window.innerHeight;

          // Why Exists Line Progress
          if (whyExistsSec && whyLineFill) {
            const rect = whyExistsSec.getBoundingClientRect();
            if (rect.top < winH / 2 && rect.bottom > 0) {
              let progress = (winH / 2 - rect.top) / (rect.height);
              progress = Math.max(0, Math.min(1, progress));
              whyLineFill.style.height = `${progress * 100}%`;
            }
          }

          // PRESERVED LESS NOISE ANIMATION (EXACT ORIGINAL FORMULA)
          if (lessNoiseSec && word1 && word2 && !isReducedMotion) {
            const rect = lessNoiseSec.getBoundingClientRect();
            if (rect.top < winH && rect.bottom > 0) {
              const progress = 1 - (rect.bottom / (rect.height + winH)); // 0 to 1 as it scrolls
              
              if (progress < 0.4) {
                word1.style.opacity = 1 - (progress * 2.5);
                word1.style.transform = `translate(-50%, -50%) scale(${1 + progress * 0.5})`;
                word2.style.opacity = 0;
                word2.style.transform = 'translate(-50%, -50%) scale(0.9)';
              } else {
                word1.style.opacity = 0;
                const p2 = (progress - 0.4) / 0.6; // 0 to 1
                word2.style.opacity = p2 * 1.5;
                word2.style.transform = `translate(-50%, -50%) scale(${0.9 + p2 * 0.1})`;
              }
            }
          }
          
          // Parallax Handler
          parallaxEls.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-parallax')) || 0.05;
            const rect = el.getBoundingClientRect();
            if (rect.top < winH && rect.bottom > 0) {
              const yPos = (rect.top - winH/2) * speed;
              el.style.transform = `translateY(${yPos}px)`;
            }
          });

          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

  });
})();
