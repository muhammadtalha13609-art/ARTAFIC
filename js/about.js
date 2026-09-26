/* ============================================================
   ARTAFIC — About Page Motion Design & Interactive Engine (v3.3)
   Performance-first architecture:
   - GPU-accelerated CSS transforms and opacity
   - Single unified rAF scroll loop for progress bar, watermarks parallax,
     and preserved kinematic craft animation
   - IntersectionObserver triggers with immediate unobserve
   - Restrained desktop-only mouse parallax with damped lerp
   - Fully accessible: respects prefers-reduced-motion
   ============================================================ */

(function() {
  function createPathsSVG(position, themeMode) {
    let paths = '';
    const numPaths = window.innerWidth < 768 ? 14 : 26;
    
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
    const aboutPage = document.querySelector('.about-page');
    const hero = document.querySelector('.about-hero');
    if (!aboutPage && !hero) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Inject Floating Paths Backgrounds
    document.querySelectorAll('.floating-paths-bg').forEach(container => {
      if (container.children.length === 0) {
        const pos = parseFloat(container.dataset.pos || '1');
        const theme = container.dataset.theme || 'normal';
        container.innerHTML = createPathsSVG(pos, theme);
      }
    });

    // 2. Hero Staggered Entrance
    if (hero) {
      if (prefersReducedMotion) {
        hero.classList.add('is-hero-loaded');
      } else {
        setTimeout(() => {
          hero.classList.add('is-hero-loaded');
        }, 80);
      }
    }

    // 3. Elements Cache for Unified Scroll Engine
    const progressBar = document.getElementById('about-scroll-progress');
    const parallaxWatermarks = document.querySelectorAll('[data-parallax]');
    const lessNoiseSec = document.querySelector('.less-noise');
    const word1 = document.querySelector('.less-noise__word1');
    const word2 = document.querySelector('.less-noise__word2');

    // 4. Unified Passive Scroll Handler (rAF Throttled)
    let isScrollTicking = false;

    function onScrollTick() {
      const scrollY = window.scrollY;
      const winH = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight - winH;

      // A. Scroll Progress Bar
      if (progressBar && docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
        progressBar.style.width = progress.toFixed(2) + '%';
      }

      // B. Subtle Background Watermark Parallax (Desktop Only)
      if (!prefersReducedMotion && window.innerWidth >= 768 && parallaxWatermarks.length > 0) {
        parallaxWatermarks.forEach(el => {
          const parent = el.parentElement;
          if (!parent) return;
          const rect = parent.getBoundingClientRect();
          if (rect.bottom > -150 && rect.top < winH + 150) {
            const factor = parseFloat(el.dataset.parallax || '-0.05');
            const sectionCenter = rect.top + rect.height / 2;
            const viewCenter = winH / 2;
            const rawDeltaY = (sectionCenter - viewCenter) * factor;
            // Constrain movement strictly within safe ±14px boundary to preserve safe content area
            const deltaY = Math.max(-14, Math.min(14, rawDeltaY));
            el.style.transform = `translateY(${deltaY.toFixed(1)}px)`;
          }
        });
      }

      // C. Preserved Kinetic Craft Animation ("YOUR BUSINESS. OUR CRAFT.")
      if (lessNoiseSec && word1 && word2) {
        const rect = lessNoiseSec.getBoundingClientRect();
        if (rect.top < winH && rect.bottom > 0) {
          const progress = 1 - (rect.bottom / (rect.height + winH));
          if (progress < 0.4) {
            word1.style.opacity = Math.max(0, 1 - (progress * 2.5));
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
      }

      isScrollTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!isScrollTicking) {
        window.requestAnimationFrame(onScrollTick);
        isScrollTicking = true;
      }
    }, { passive: true });
    onScrollTick();

    // 5. Lightweight Intersection Observer for Entrance Reveals & Section Dividers
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { root: null, rootMargin: '0px 0px -40px 0px', threshold: 0.1 });

      document.querySelectorAll('.fade-up:not(.about-hero *), .who-we-are, .section-divider').forEach(el => {
        revealObserver.observe(el);
      });

      // 6. Timeline Story Node Observer
      const storyNodes = document.querySelectorAll('.story-node');
      const railProgress = document.getElementById('story-rail-progress');
      const timelineContainer = document.querySelector('.story-timeline');

      if (storyNodes.length > 0 && railProgress && timelineContainer) {
        const timelineObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-active');
              
              let maxIndex = 0;
              storyNodes.forEach((node, idx) => {
                if (node.classList.contains('is-active')) {
                  maxIndex = idx;
                }
              });
              
              const progressPct = ((maxIndex + 0.6) / storyNodes.length) * 100;
              railProgress.style.height = Math.min(100, progressPct) + '%';
            }
          });
        }, { root: null, rootMargin: '0px 0px -15% 0px', threshold: 0.2 });

        storyNodes.forEach(node => {
          timelineObserver.observe(node);
        });
      }
    } else {
      document.querySelectorAll('.fade-up, .who-we-are, .section-divider, .story-node').forEach(el => {
        el.classList.add('is-revealed', 'is-active');
      });
      const railProgress = document.getElementById('story-rail-progress');
      if (railProgress) railProgress.style.height = '100%';
    }

    // 7. Restrained Desktop-Only Mouse Interaction
    const mouseElements = document.querySelectorAll('[data-mouse-parallax]');
    if (mouseElements.length > 0 && !prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let targetX = 0, targetY = 0;
      let currentX = 0, currentY = 0;
      let rAFParallax = null;

      function onMouseMove(e) {
        const halfW = window.innerWidth / 2;
        const halfH = window.innerHeight / 2;
        targetX = (e.clientX - halfW) / halfW;
        targetY = (e.clientY - halfH) / halfH;

        if (!rAFParallax) {
          rAFParallax = requestAnimationFrame(updateMouseParallax);
        }
      }

      function updateMouseParallax() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        mouseElements.forEach(el => {
          const factor = parseFloat(el.dataset.mouseParallax || '4');
          const tx = (currentX * factor).toFixed(2);
          const ty = (currentY * factor).toFixed(2);
          el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        });

        if (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
          rAFParallax = requestAnimationFrame(updateMouseParallax);
        } else {
          rAFParallax = null;
        }
      }

      window.addEventListener('mousemove', onMouseMove, { passive: true });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initAboutPage);
  } else {
    window.initAboutPage();
  }
})();
