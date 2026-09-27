/* ============================================================
   ARTAFIC — Scroll-Driven Hero Typography Zoom Engine
   Lightweight, high-performance, GPU-accelerated implementation
   - Single passive scroll handler throttled with requestAnimationFrame
   - Pure transform: translate3d(...) scale(...) and opacity
   - Zero layout thrashing, zero external dependencies
   ============================================================ */

(function() {
  'use strict';

  function initHeroZoom() {
    const containers = document.querySelectorAll('.hero-zoom-container');
    if (!containers.length) return;

    containers.forEach(container => {
      if (container._cleanupHeroZoom) {
        container._cleanupHeroZoom();
      }

      const stage = container.querySelector('.hero-zoom-stage');
      const watermark = container.querySelector('.hero-zoom-watermark');
      const foreground = container.querySelector('.hero-zoom-foreground');
      const bg = container.querySelector('.about-hero__bg');
      const hint = container.querySelector('.hero-zoom-hint');
      const nextSelector = container.dataset.nextSection;

      if (!stage || !watermark || !foreground) return;

      // Click on hint to smoothly scroll into the next section
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

      function updateZoom() {
        const rect = container.getBoundingClientRect();
        const winH = window.innerHeight;

        // If hero container is scrolled completely out of view, skip math
        if (rect.bottom < -50 || rect.top > winH + 50) {
          isTicking = false;
          return;
        }

        const scrollDistance = rect.height - winH;
        if (scrollDistance <= 0) {
          isTicking = false;
          return;
        }

        // Progress from 0 (top of page) to 1 (when hero finishes and next section arrives)
        const rawProgress = -rect.top / scrollDistance;
        const progress = Math.max(0, Math.min(1, rawProgress));

        // Smooth cubic easing curve: letters grow steadily, then accelerate through viewport
        const t = progress;
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const isMobile = window.innerWidth < 768;
        const maxScale = isMobile ? 4.0 : 5.8;
        const watermarkScale = 1 + (maxScale - 1) * eased;

        // Subtle controlled translation (moves slightly horizontally and vertically)
        const driftX = (progress * (isMobile ? 18 : 36)).toFixed(1);
        const driftY = (-progress * (isMobile ? 14 : 26)).toFixed(1);

        // Watermark opacity: starts at 0.10, peaks slightly at 0.14, and fades out as it crops beyond viewport
        let watermarkOpacity = 0.10;
        if (progress < 0.60) {
          watermarkOpacity = 0.10 + progress * 0.06; // 0.10 -> 0.136
        } else {
          watermarkOpacity = Math.max(0, 0.136 * (1 - (progress - 0.60) / 0.35)); // 0.136 -> 0
        }

        // Apply transform to the large background typography
        watermark.style.transform = `translate3d(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px), 0) scale(${watermarkScale.toFixed(3)})`;
        watermark.style.opacity = watermarkOpacity.toFixed(4);

        // Foreground content stays completely crisp and readable from 0% to 70%
        // From 70% to 100%, it gently fades out with a subtle upward translate as the next section comes in
        let fgOpacity = 1;
        let fgY = 0;
        if (progress > 0.70) {
          const fadeProgress = (progress - 0.70) / 0.30;
          fgOpacity = Math.max(0, 1 - fadeProgress);
          fgY = -fadeProgress * 28;
        }
        foreground.style.opacity = fgOpacity.toFixed(3);
        foreground.style.transform = `translate3d(0, ${fgY.toFixed(1)}px, 0)`;

        // Background image subtle depth zoom
        if (bg) {
          const bgScale = 1 + eased * 0.10;
          bg.style.transform = `translate3d(0, 0, 0) scale(${bgScale.toFixed(3)})`;
        }

        // Scroll hint fades out promptly on initial scroll
        if (hint) {
          hint.style.opacity = Math.max(0, 1 - progress * 5.0).toFixed(2);
          hint.style.pointerEvents = progress > 0.05 ? 'none' : 'auto';
        }

        isTicking = false;
      }

      function onScroll() {
        if (isTicking) return;
        isTicking = true;
        window.requestAnimationFrame(updateZoom);
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });

      // Apply initial state immediately
      updateZoom();

      container._cleanupHeroZoom = () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      };
    });
  }

  window.initHeroZoom = initHeroZoom;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroZoom);
  } else {
    initHeroZoom();
  }
})();
