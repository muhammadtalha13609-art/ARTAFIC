/* ============================================================
   ARTAFIC — About Page Interactive Scripts
   Zero continuous WebGL/Canvas loops. Pure lightweight IntersectionObserver
   and preserved kinetic scroll transition for "YOUR BUSINESS. OUR CRAFT."
   ============================================================ */

(function() {
  function createPathsSVG(position, themeMode) {
    let paths = '';
    const numPaths = window.innerWidth < 768 ? 16 : 32;
    
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
        color = Math.random() < 0.25 ? `rgba(20, 184, 166, ${0.12 + i * 0.015})` : `rgba(255, 255, 255, ${0.03 + i * 0.005})`;
      } else if (themeMode === 'minimal') {
        color = `rgba(255, 255, 255, ${0.02 + i * 0.002})`;
      } else if (themeMode === 'light') {
        color = i % 5 === 0 ? `rgba(20, 184, 166, ${(0.08 + i * 0.004).toFixed(3)})` : `rgba(15, 23, 42, ${(0.025 + i * 0.003).toFixed(3)})`;
      } else {
        color = Math.random() < 0.06 ? `rgba(20, 184, 166, ${0.06 + i * 0.01})` : `rgba(255, 255, 255, ${0.02 + i * 0.004})`;
      }
      
      const width = 0.5 + i * 0.03;
      paths += `<path d="${d}" stroke="${color}" stroke-width="${width}" fill="none" class="fp-path" />`;
    }
    return `<svg class="fp-svg" viewBox="0 0 696 316" preserveAspectRatio="xMidYMid slice">${paths}</svg>`;
  }

  window.initAboutPage = function() {
    const hero = document.querySelector('.about-hero');
    if (!hero) return;

    // 1. Inject Static Floating Paths
    document.querySelectorAll('.floating-paths-bg').forEach(container => {
      const pos = parseFloat(container.dataset.pos || '1');
      const theme = container.dataset.theme || 'normal';
      container.innerHTML = createPathsSVG(pos, theme);
    });

    // 2. Initial Page Load Reveal
    setTimeout(() => {
      document.querySelectorAll('.about-hero .fade-up').forEach(el => {
        el.classList.add('is-revealed');
      });
    }, 120);

    // 3. Lightweight Intersection Observer for Entrance Transitions
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    document.querySelectorAll('.fade-up:not(.about-hero *)').forEach(el => {
      revealObserver.observe(el);
    });

    // 4. PRESERVED CRAFT ANIMATION ("YOUR BUSINESS. OUR CRAFT.")
    // Exact kinematic scroll logic preserved with zero performance penalty
    const lessNoiseSec = document.querySelector('.less-noise');
    const word1 = document.querySelector('.less-noise__word1');
    const word2 = document.querySelector('.less-noise__word2');
    let ticking = false;

    if (lessNoiseSec && word1 && word2) {
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const winH = window.innerHeight;
            const rect = lessNoiseSec.getBoundingClientRect();
            
            if (rect.top < winH && rect.bottom > 0) {
              const progress = 1 - (rect.bottom / (rect.height + winH));
              
              if (progress < 0.4) {
                word1.style.opacity = 1 - (progress * 2.5);
                word1.style.transform = `translate(-50%, -50%) scale(${1 + progress * 0.5})`;
                word2.style.opacity = 0;
                word2.style.transform = 'translate(-50%, -50%) scale(0.9)';
              } else {
                word1.style.opacity = 0;
                const p2 = (progress - 0.4) / 0.6;
                word2.style.opacity = Math.min(1, p2 * 1.5);
                word2.style.transform = `translate(-50%, -50%) scale(${0.9 + p2 * 0.1})`;
              }
            }
            
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initAboutPage);
  } else {
    window.initAboutPage();
  }
})();
