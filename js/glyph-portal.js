/* ============================================================
   ARTAFIC — Hero Scroll Zoom Animation Engine (v2.1)
   Cinematic scroll-driven camera zoom through live typography
   ============================================================ */

(function() {
  'use strict';

  function initHeroZoom() {
    const containers = document.querySelectorAll('.hero-zoom-container');
    if (!containers.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    containers.forEach(container => {
      if (container._cleanupHeroZoom) {
        container._cleanupHeroZoom();
      }

      const stage = container.querySelector('.hero-zoom-stage');
      const bg = container.querySelector('.hero-zoom-bg');
      const target = container.querySelector('.hero-zoom-target');
      const watermark = container.querySelector('.hero-watermark');
      const hint = container.querySelector('.hero-zoom-hint');
      const glow = container.querySelector('.about-hero__ambient-glow');
      const nextSelector = container.dataset.nextSection;

      if (!stage || !target) return;

      // Click on hint to smoothly navigate into the next section
      if (hint && nextSelector) {
        hint.addEventListener('click', (e) => {
          e.preventDefault();
          const nextEl = document.querySelector(nextSelector);
          if (nextEl) {
            const navH = document.getElementById('nav')?.offsetHeight || 72;
            const top = nextEl.getBoundingClientRect().top + window.scrollY - navH;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
          }
        });
      }

      let isTicking = false;

      function onScroll() {
        if (isTicking) return;
        isTicking = true;

        window.requestAnimationFrame(() => {
          const rect = container.getBoundingClientRect();
          const winH = window.innerHeight;
          const scrollDistance = rect.height - winH;

          if (scrollDistance <= 0) {
            isTicking = false;
            return;
          }

          // Progress from 0 (top of page) to 1 (when hero finishes and next section arrives)
          const rawProgress = -rect.top / scrollDistance;
          const progress = Math.max(0, Math.min(1, rawProgress));

          // Easing curve inspired by glyph-portal: smooth cubic ease-in-out
          const t = Math.min(1, progress / 0.85);
          const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

          // Subtle cinematic camera roll (-2.8deg at peak, returning smoothly to 0)
          const roll = -2.8 * Math.sin(t * Math.PI);

          // 1. Foreground Title Zoom (Exponential 1x up to 20x scale)
          const titleScale = Math.exp(Math.log(1) + Math.log(20) * eased);
          // Opacity stays 1 until t reaches 0.65, then smoothly fades out as letters fly past the camera
          const titleFade = t < 0.65 ? 1 : Math.max(0, 1 - (t - 0.65) / 0.30);
          target.style.transform = `translate3d(0, 0, 0) scale(${titleScale.toFixed(3)}) rotate(${roll.toFixed(2)}deg)`;
          target.style.opacity = titleFade.toFixed(3);

          // 2. Background Watermark Typography Zoom (1x up to 6.5x scale)
          if (watermark) {
            const watermarkScale = Math.exp(Math.log(1) + Math.log(6.5) * eased);
            const watermarkFade = t < 0.60 ? 1 : Math.max(0, 1 - (t - 0.60) / 0.35);
            const baseOpacity = 0.04;
            watermark.style.transform = `translate(-50%, -50%) scale(${watermarkScale.toFixed(3)}) rotate(${(roll * 0.5).toFixed(2)}deg)`;
            watermark.style.opacity = (baseOpacity * watermarkFade).toFixed(4);
          }

          // 3. Background Image Subtle Dolly Zoom (1x up to 1.14x scale)
          if (bg) {
            const bgScale = 1 + eased * 0.14;
            bg.style.transform = `scale(${bgScale.toFixed(3)})`;
          }

          // 4. Ambient Glow Expansion
          if (glow) {
            const glowScale = 1 + eased * 0.6;
            glow.style.transform = `translate3d(0, 0, 0) scale(${glowScale.toFixed(3)})`;
          }

          // 5. Hint fade out on initial scroll
          if (hint) {
            hint.style.opacity = Math.max(0, 1 - progress * 4.5).toFixed(2);
            hint.style.pointerEvents = progress > 0.08 ? 'none' : 'auto';
          }

          isTicking = false;
        });
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll(); // Apply initial state immediately

      container._cleanupHeroZoom = () => {
        window.removeEventListener('scroll', onScroll);
      };
    });
  }

  window.initHeroZoom = initHeroZoom;
  window.initGlyphPortals = initHeroZoom;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroZoom);
  } else {
    initHeroZoom();
  }
})();
