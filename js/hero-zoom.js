/* ============================================================
   ARTAFIC — Scroll-Driven Character-Focused Zoom Engine
   Camera dives into one specific character of the hero heading
   - Wraps characters in lightweight spans at runtime
   - Shifts transform-origin toward focus character as scale grows
   - Single passive scroll handler, rAF-throttled
   - Pure CSS transforms: translate3d, scale, transform-origin
   - Zero canvas, zero SVG clip, zero external dependencies
   ============================================================ */

(function () {
  'use strict';

  function initHeroZoom() {
    var containers = document.querySelectorAll('.hero-zoom-container');
    if (!containers.length) return;

    containers.forEach(function (container) {
      // Cleanup any previous instance (SPA re-navigation)
      if (container._cleanupHeroZoom) {
        container._cleanupHeroZoom();
      }

      var stage = container.querySelector('.hero-zoom-stage');
      var foreground = container.querySelector('.hero-zoom-foreground');
      var titleEl = container.querySelector('.about-hero__title');
      var bg = container.querySelector('.about-hero__bg');
      var glow = container.querySelector('.about-hero__ambient-glow');
      var hint = container.querySelector('.hero-zoom-hint');
      var nextSelector = container.dataset.nextSection;
      var zoomCharIdx = parseInt(container.dataset.zoomChar || '0', 10);

      if (!stage || !foreground || !titleEl) return;

      // ── Wrap each character in a lightweight <span> ──────────
      var textEl = titleEl.querySelector('strong') || titleEl;
      var originalHTML = textEl.innerHTML;
      var text = textEl.textContent;

      textEl.innerHTML = '';
      var charSpans = [];

      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (ch === ' ' || ch === '\u00A0') {
          // Preserve spaces as plain text nodes
          textEl.appendChild(document.createTextNode(ch));
        } else {
          var span = document.createElement('span');
          span.className = 'hz-char';
          span.textContent = ch;
          charSpans.push(span);
          textEl.appendChild(span);
        }
      }

      // Identify focus character (clamped to valid range)
      var focusIdx = Math.max(0, Math.min(zoomCharIdx, charSpans.length - 1));
      var focusSpan = charSpans[focusIdx] || null;

      // ── Measure focus character center relative to foreground ─
      var charOriginX = 50;
      var charOriginY = 50;

      function measureCharPosition() {
        if (!focusSpan) return;
        var fgRect = foreground.getBoundingClientRect();
        var charRect = focusSpan.getBoundingClientRect();
        if (fgRect.width > 0 && fgRect.height > 0) {
          charOriginX = ((charRect.left + charRect.width / 2 - fgRect.left) / fgRect.width) * 100;
          charOriginY = ((charRect.top + charRect.height / 2 - fgRect.top) / fgRect.height) * 100;
        }
      }

      // Measure after layout & fonts are ready
      requestAnimationFrame(function () {
        requestAnimationFrame(measureCharPosition);
      });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(measureCharPosition);
      }

      // ── Scroll hint click ───────────────────────────────────
      function onHintClick(e) {
        e.preventDefault();
        var nextEl = document.querySelector(nextSelector);
        if (nextEl) {
          var navH = document.getElementById('nav');
          navH = navH ? navH.offsetHeight : 72;
          var top = nextEl.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
      }
      if (hint && nextSelector) {
        hint.addEventListener('click', onHintClick);
      }

      // ── Scroll-driven zoom animation ────────────────────────
      var isTicking = false;
      var lastWidth = window.innerWidth;

      function updateZoom() {
        // Re-measure on viewport width change (responsive reflow)
        if (window.innerWidth !== lastWidth) {
          lastWidth = window.innerWidth;
          measureCharPosition();
        }

        var rect = container.getBoundingClientRect();
        var winH = window.innerHeight;

        // Skip if completely off-screen
        if (rect.bottom < -50 || rect.top > winH + 50) {
          isTicking = false;
          return;
        }

        var scrollDistance = rect.height - winH;
        if (scrollDistance <= 0) {
          isTicking = false;
          return;
        }

        // 0 → top-aligned, 1 → container fully scrolled past
        var rawProgress = -rect.top / scrollDistance;
        var progress = Math.max(0, Math.min(1, rawProgress));

        // Cubic ease-in-out for accelerating zoom
        var t = progress;
        var eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        var isMobile = window.innerWidth < 768;
        var maxScale = isMobile ? 10.0 : 15.0;
        var titleScale = 1 + (maxScale - 1) * eased;

        // ── Transform-origin: shift from center → focus character ──
        // Completes by ~30% scroll while scale is still modest (~2.4×)
        // so the positional shift is subtle and feels like camera panning
        var originT = Math.min(1, progress / 0.30);
        // Ease-out quadratic: fast initial shift, smooth settle
        var originEased = 1 - (1 - originT) * (1 - originT);

        var curOriginX = 50 + (charOriginX - 50) * originEased;
        var curOriginY = 50 + (charOriginY - 50) * originEased;

        foreground.style.transformOrigin =
          curOriginX.toFixed(2) + '% ' + curOriginY.toFixed(2) + '%';

        // ── Scale ──────────────────────────────────────────────
        foreground.style.transform =
          'translate3d(0,0,0) scale(' + titleScale.toFixed(3) + ')';

        // ── Opacity: hold at 1.0, then dissolve as letter fills viewport ──
        var titleOpacity =
          progress < 0.62
            ? 1
            : Math.max(0, 1 - (progress - 0.62) / 0.28);
        foreground.style.opacity = titleOpacity.toFixed(3);

        // ── Background parallax zoom ───────────────────────────
        if (bg) {
          var bgScale = 1 + eased * 0.12;
          bg.style.transform =
            'translate3d(0,0,0) scale(' + bgScale.toFixed(3) + ')';
        }

        // ── Ambient glow gentle swell ──────────────────────────
        if (glow) {
          var glowScale = 1 + eased * 0.45;
          glow.style.transform =
            'translate3d(0,0,0) scale(' + glowScale.toFixed(3) + ')';
        }

        // ── Scroll hint fade ───────────────────────────────────
        if (hint) {
          hint.style.opacity = Math.max(0, 1 - progress * 5).toFixed(2);
          hint.style.pointerEvents = progress > 0.05 ? 'none' : 'auto';
        }

        isTicking = false;
      }

      function onScroll() {
        if (isTicking) return;
        isTicking = true;
        requestAnimationFrame(updateZoom);
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });

      // Apply initial state
      updateZoom();

      // ── Cleanup for SPA re-navigation ────────────────────────
      container._cleanupHeroZoom = function () {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        if (hint) hint.removeEventListener('click', onHintClick);
        // Restore original heading HTML
        textEl.innerHTML = originalHTML;
        foreground.style.transformOrigin = '';
        foreground.style.transform = '';
        foreground.style.opacity = '';
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
