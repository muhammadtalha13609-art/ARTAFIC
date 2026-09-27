/* ============================================================
   ARTAFIC — GridPulse Interactive Canvas Animation
   Full-section interactive background grid for Get In Touch section
   - Canvas-based hairline grid with interactive spectral lighting on cursor move
   - High-contrast jewel tints calibrated for light ground
   - Text avoidance: automatically dims cells behind [data-grid-avoid] elements
   - Idle sleeping: rAF loop halts completely when cells fade out (0% CPU/GPU idle)
   - Viewport-paused with IntersectionObserver
   ============================================================ */

(function () {
  'use strict';

  const HUE_TOP = 60;
  const HUE_SPAN = 270;
  // High-saturation jewel tints calibrated for light ground (#F0FDFA)
  const TINTS_LIGHT = [58, 50, 44, 38, 32];
  // Bright tints for dark ground
  const TINTS_DARK = [88, 80, 72, 64, 56];
  const FAINT = 0.18;
  const FADE = 2.2;
  const PAD = 8;
  const FADE_IN = 140;
  const FADE_OUT = 750;

  const easeOut = (t) => 1 - Math.pow(1 - t, 2);
  const easeIn = (t) => t * t;

  function initGridPulse() {
    const pulseElements = document.querySelectorAll('.grid-pulse');
    if (!pulseElements.length) return;

    pulseElements.forEach((el) => {
      if (el._cleanupGridPulse) {
        el._cleanupGridPulse();
      }

      const canvas = el.querySelector('canvas') || el.querySelector('.grid-pulse__canvas');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const isMobile = window.innerWidth < 768;
      const cell = isMobile ? 22 : 26;
      const reach = isMobile ? 2.2 : 2.8;
      const ambient = isMobile ? 2 : 3;
      const maxLit = isMobile ? 120 : 220;
      const avoidSelector = el.dataset.avoid || '[data-grid-avoid]';

      let cols = 1;
      let rows = 1;
      let width = 0;
      let height = 0;
      let clear = [];
      let tints = TINTS_LIGHT;
      const cells = new Map();

      // Determine ground lightness to choose optimal tint palette
      const readTheme = () => {
        try {
          let cur = el.parentElement;
          let bg = '';
          while (cur && (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)')) {
            bg = window.getComputedStyle(cur).backgroundColor;
            cur = cur.parentElement;
          }
          if (bg && bg.startsWith('rgb')) {
            const rgb = bg.match(/\d+/g).map(Number);
            const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
            tints = lum > 0.5 ? TINTS_LIGHT : TINTS_DARK;
          } else {
            tints = TINTS_LIGHT;
          }
        } catch (_) {
          tints = TINTS_LIGHT;
        }
      };

      // Measure avoid targets so grid cells dim safely behind text
      const measureText = () => {
        const bounds = el.getBoundingClientRect();
        const scope = el.parentElement || document;
        const avoidNodes = scope.querySelectorAll(avoidSelector);
        clear = [];

        avoidNodes.forEach((node) => {
          try {
            const range = document.createRange();
            range.selectNodeContents(node);
            const lines = Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
            const boxes = lines.length > 0 ? lines : [node.getBoundingClientRect()];
            boxes.forEach((r) => {
              clear.push(
                new DOMRect(
                  r.left - bounds.left - PAD,
                  r.top - bounds.top - PAD,
                  r.width + PAD * 2,
                  r.height + PAD * 2
                )
              );
            });
          } catch (_) {
            const r = node.getBoundingClientRect();
            clear.push(
              new DOMRect(
                r.left - bounds.left - PAD,
                r.top - bounds.top - PAD,
                r.width + PAD * 2,
                r.height + PAD * 2
              )
            );
          }
        });
      };

      const measure = () => {
        width = el.clientWidth || window.innerWidth;
        height = el.clientHeight || 600;
        cols = Math.max(1, Math.ceil(width / cell));
        rows = Math.max(1, Math.ceil(height / cell));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        readTheme();
        measureText();
        wake();
      };

      // Dim factor based on proximity to avoid rects
      const brightness = (col, row) => {
        const x = col * cell + cell / 2;
        const y = row * cell + cell / 2;
        let nearest = Number.POSITIVE_INFINITY;
        for (let i = 0; i < clear.length; i++) {
          const r = clear[i];
          const dx = Math.max(r.left - x, 0, x - r.right);
          const dy = Math.max(r.top - y, 0, y - r.bottom);
          nearest = Math.min(nearest, Math.hypot(dx, dy));
          if (nearest === 0) break;
        }
        if (nearest === Number.POSITIVE_INFINITY) return 1;
        return FAINT + (1 - FAINT) * Math.min(1, nearest / (FADE * cell));
      };

      const ink = (row) => {
        const t = rows > 1 ? Math.min(1, row / (rows - 1)) : 0;
        const hue = (((HUE_TOP - t * HUE_SPAN) % 360) + 360) % 360;
        const tint = tints[Math.floor(Math.random() * tints.length)];
        return `hsl(${Math.round(hue)} 96% ${tint}%)`;
      };

      let frame = 0;
      const draw = (now) => {
        frame = 0;
        ctx.clearRect(0, 0, width, height);

        for (const [key, c] of cells) {
          let alpha;
          if (now < c.until) {
            alpha = easeOut(Math.min(1, (now - c.born) / FADE_IN));
          } else {
            const t = (now - c.until) / FADE_OUT;
            if (t >= 1) {
              cells.delete(key);
              continue;
            }
            alpha = 1 - easeIn(t);
          }
          ctx.globalAlpha = Math.min(1, alpha * c.dim);
          ctx.fillStyle = c.colour;
          ctx.fillRect(c.col * cell + 1, c.row * cell + 1, cell - 1, cell - 1);
        }

        ctx.globalAlpha = 1;
        if (cells.size > 0) {
          frame = requestAnimationFrame(draw);
        }
      };

      const wake = () => {
        if (!frame) frame = requestAnimationFrame(draw);
      };

      const light = (col, row, hold) => {
        if (col < 0 || row < 0 || col >= cols || row >= rows) return;
        if (cells.size >= maxLit) return;
        const key = `${col},${row}`;
        const now = performance.now();
        const lit = cells.get(key);
        if (lit && now < lit.until) return;

        let born = now;
        if (lit) {
          const faded = 1 - easeIn(Math.min(1, (now - lit.until) / FADE_OUT));
          born = now - (1 - Math.sqrt(Math.max(0, 1 - faded))) * FADE_IN;
        }

        cells.set(key, {
          col,
          row,
          colour: lit ? lit.colour : ink(row),
          dim: brightness(col, row),
          born,
          until: now + hold,
        });
        wake();
      };

      // Cursor interaction: lights up cells across the whole section
      let pending = 0;
      let at = null;

      const paint = () => {
        pending = 0;
        if (!at) return;
        const cx = Math.floor(at.x / cell);
        const cy = Math.floor(at.y / cell);
        const span = Math.ceil(reach);

        for (let dy = -span; dy <= span; dy++) {
          for (let dx = -span; dx <= span; dx++) {
            const away = Math.hypot(dx, dy);
            if (away > reach) continue;
            if (Math.random() > 1 - away / (reach + 0.6)) continue;
            light(cx + dx, cy + dy, 320 + Math.random() * 850);
          }
        }
      };

      const onMove = (event) => {
        const bounds = el.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;

        // Trigger if cursor is anywhere within or near the full grid section
        if (x < -20 || y < -20 || x > bounds.width + 20 || y > bounds.height + 20) return;

        at = { x: Math.max(0, Math.min(bounds.width, x)), y: Math.max(0, Math.min(bounds.height, y)) };
        if (!pending) pending = requestAnimationFrame(paint);
      };

      const onTouch = (event) => {
        if (!event.touches || !event.touches[0]) return;
        const touch = event.touches[0];
        const bounds = el.getBoundingClientRect();
        const x = touch.clientX - bounds.left;
        const y = touch.clientY - bounds.top;

        if (x < -20 || y < -20 || x > bounds.width + 20 || y > bounds.height + 20) return;

        at = { x: Math.max(0, Math.min(bounds.width, x)), y: Math.max(0, Math.min(bounds.height, y)) };
        if (!pending) pending = requestAnimationFrame(paint);
      };

      // Ambient drift: subtly lights up a few cells periodically so grid stays alive
      let visible = true;
      let beat = 0;

      const drift = () => {
        beat = window.setTimeout(drift, 1200 + Math.random() * 1600);
        if (!visible || document.hidden) return;
        for (let i = 0; i < ambient; i++) {
          light(
            Math.floor(Math.random() * cols),
            Math.floor(Math.random() * rows),
            850 + Math.random() * 1500
          );
        }
      };
      beat = window.setTimeout(drift, 200);

      // Initial lighting burst so the user immediately sees the alive grid on arrival
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          light(
            Math.floor(Math.random() * cols),
            Math.floor(Math.random() * rows),
            900 + Math.random() * 1200
          );
        }, 80 * i);
      }

      // Viewport visibility observer
      let sight = null;
      if ('IntersectionObserver' in window) {
        sight = new IntersectionObserver(([entry]) => {
          visible = entry ? entry.isIntersecting : true;
          if (visible) {
            measure();
          }
        });
        sight.observe(el);
      }

      // Resize observer
      let resize = null;
      if ('ResizeObserver' in window) {
        resize = new ResizeObserver(() => {
          measure();
        });
        resize.observe(el);
      }

      measure();

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(measureText).catch(() => {});
      }

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('touchstart', onTouch, { passive: true });
      window.addEventListener('touchmove', onTouch, { passive: true });
      window.addEventListener('resize', measure, { passive: true });

      el._cleanupGridPulse = () => {
        if (sight) sight.disconnect();
        if (resize) resize.disconnect();
        cancelAnimationFrame(frame);
        cancelAnimationFrame(pending);
        clearTimeout(beat);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('touchstart', onTouch);
        window.removeEventListener('touchmove', onTouch);
        window.removeEventListener('resize', measure);
      };
    });
  }

  window.initGridPulse = initGridPulse;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGridPulse);
  } else {
    initGridPulse();
  }
})();
