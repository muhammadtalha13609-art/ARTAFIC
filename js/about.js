/**
 * ARTAFIC — About Page Interactive Engine v2.3
 * Master UI/UX Pro Max + React Bits Animation Toolbox + ECC Verification
 */
(function initAboutMasterExperience() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. React Bits Background Tool: Floating Paths SVG Generator
  function createPathsSVG(position, themeMode) {
    let paths = '';
    const isMobile = window.innerWidth < 768;
    const numPaths = isMobile ? 16 : 32;
    
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
        color = Math.random() < 0.2 ? `rgba(20, 184, 166, ${0.12 + i * 0.015})` : `rgba(241, 240, 234, ${0.03 + i * 0.005})`;
      } else if (themeMode === 'minimal') {
        color = `rgba(241, 240, 234, ${0.02 + i * 0.002})`;
      } else {
        color = Math.random() < 0.05 ? `rgba(20, 184, 166, ${0.06 + i * 0.01})` : `rgba(241, 240, 234, ${0.02 + i * 0.005})`;
      }
      
      const width = 0.5 + i * 0.03;
      const duration = 22 + Math.random() * 10;
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

    // 2. React Bits Tool 1: Staggered Text Mask Reveal
    setTimeout(() => {
      document.querySelectorAll('.about-intro .reveal-text-inner, .about-intro .fade-up').forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('is-revealed');
        }, index * 90);
      });
    }, 100);

    // Scroll Prompt Button Click Handler
    const scrollPrompt = document.getElementById('scroll-prompt');
    if (scrollPrompt) {
      scrollPrompt.addEventListener('click', () => {
        const nextSec = document.getElementById('what-we-do');
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
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    document.querySelectorAll('.reveal-text-inner:not(.about-intro *), .fade-up:not(.about-intro *)').forEach(el => {
      revealObserver.observe(el);
    });

    // 4. React Bits Tool 3: Timeline Progress & Node Observer (Section 04)
    const timelineCards = document.querySelectorAll('.timeline-card');
    const timelineFill = document.querySelector('.timeline-sequence__line-fill');
    
    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          entry.target.classList.add('is-active');
          const step = parseInt(entry.target.dataset.step || '1');
          if (timelineFill) {
            timelineFill.style.width = `${(step / timelineCards.length) * 100}%`;
          }
        }
      });
    }, { rootMargin: '-10% 0px -25% 0px', threshold: [0.2, 0.5] });

    timelineCards.forEach(card => timelineObserver.observe(card));

    // 5. React Bits Tool 4: How We Think Sticky Sync (Section 05)
    const thinkWords = document.querySelectorAll('.think-word');
    const thinkDescs = document.querySelectorAll('.think-desc');

    thinkWords.forEach((word, i) => {
      word.addEventListener('click', () => {
        thinkWords.forEach(w => w.classList.remove('is-active'));
        thinkDescs.forEach(d => d.classList.remove('is-active'));
        word.classList.add('is-active');
        if (thinkDescs[i]) {
          thinkDescs[i].classList.add('is-active');
          thinkDescs[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });

    const thinkObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          const idx = parseInt(entry.target.dataset.index || '0');
          thinkWords.forEach((w, i) => w.classList.toggle('is-active', i === idx));
          thinkDescs.forEach((d, i) => d.classList.toggle('is-active', i === idx));
        }
      });
    }, { rootMargin: '-30% 0px -30% 0px', threshold: [0.3, 0.6] });

    thinkDescs.forEach(el => thinkObserver.observe(el));

    // 6. Philosophy Active Observer (Section 06)
    const philItems = document.querySelectorAll('.phil-item');
    const philObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
        }
      });
    }, { rootMargin: '-15% 0px -20% 0px', threshold: 0.2 });
    philItems.forEach(el => philObserver.observe(el));

    // 7. Beliefs Statement Active Observer (Section 08)
    const beliefStatements = document.querySelectorAll('.belief-statement');
    const beliefObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
        }
      });
    }, { rootMargin: '-10% 0px -20% 0px', threshold: 0.2 });
    beliefStatements.forEach(el => beliefObserver.observe(el));

    // 8. Scroll Engine (Why Exists Line & PRESERVED SIGNATURE LESS NOISE ANIMATION)
    const whyExistsSec = document.getElementById('why-exists');
    const whyLineFill = document.querySelector('.why-exists__line-fill');
    const lessNoiseSec = document.getElementById('less-noise');
    const word1 = document.querySelector('.less-noise__word1');
    const word2 = document.querySelector('.less-noise__word2');

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const winH = window.innerHeight;

          // Section 03 Why Exists Line Progress
          if (whyExistsSec && whyLineFill) {
            const rect = whyExistsSec.getBoundingClientRect();
            if (rect.top < winH / 2 && rect.bottom > 0) {
              let progress = (winH / 2 - rect.top) / (rect.height);
              progress = Math.max(0, Math.min(1, progress));
              whyLineFill.style.height = `${progress * 100}%`;
            }
          }

          // Section 07 PRESERVED LESS NOISE SIGNATURE SCROLL FORMULA
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

          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

  });
})();
