/* ============================================================
   ARTAFIC — Glyph Portal Scroll Animation Engine
   A scroll-driven camera through live type.
   Adapted from Glyph Portal © 2026 Christian Katzmann (MIT).
   ============================================================ */

(function() {
  'use strict';

  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  const smooth = (a, b, n) => {
    const t = clamp((n - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  const DEFAULT_FONT = '"Montserrat", "Arial Black", "Arial", sans-serif';

  /** Largest opaque square in letter ink in linear time */
  function interior(context, char, font) {
    if (!context || !char || char === ' ') return null;
    const canvas = context.canvas;
    context.font = font;
    const m = context.measureText(char);
    const pad = 8;
    const left = Math.ceil(m.actualBoundingBoxLeft || 0);
    const ascent = Math.ceil(m.actualBoundingBoxAscent || 0);
    const right = Math.ceil(m.actualBoundingBoxRight || m.width);
    const descent = Math.ceil(m.actualBoundingBoxDescent || 0);
    canvas.width = Math.max(1, left + right + pad * 2);
    canvas.height = Math.max(1, ascent + descent + pad * 2);
    context.font = font;
    context.fontKerning = 'none';
    context.fillText(char, pad + left, pad + ascent);
    const { width, height } = canvas;
    try {
      const pixels = context.getImageData(0, 0, width, height).data;
      const rows = new Uint16Array(width + 1);
      let size = 0, bx = 0, by = 0;
      for (let y = 0; y < height; y++) {
        let diagonal = 0;
        for (let x = 0; x < width; x++) {
          const above = rows[x + 1];
          rows[x + 1] = pixels[(y * width + x) * 4 + 3] > 245
            ? Math.min(above, rows[x], diagonal) + 1 : 0;
          diagonal = above;
          if (rows[x + 1] > size) { size = rows[x + 1]; bx = x; by = y; }
        }
      }
      if (size < 3) return null;
      // Scan at 3x SVG size (since scanFont is 300px vs 100px SVG coordinate base)
      return {
        x: (bx + 1 - size / 2 - pad - left) / 3,
        y: (by + 1 - size / 2 - pad - ascent) / 3,
        radius: (size / 2 - 1) / 3
      };
    } catch (e) {
      return null;
    }
  }

  function initSinglePortal(section) {
    if (section._gpDisposed) {
      section._gpDisposed();
    }

    const uid = section.id || `gp-${Math.random().toString(36).slice(2, 9)}`;
    const clipId = `${uid}-clip`;
    const text = (section.dataset.gpWord || section.getAttribute('aria-label') || 'ABOUT US').trim().normalize('NFC');
    const length = clamp(parseFloat(section.dataset.gpLength || '2.2'), 1, 8);
    const weight = clamp(parseInt(section.dataset.gpWeight || '900', 10), 100, 1000);
    const fontFamily = section.dataset.gpFont || DEFAULT_FONT;
    const focusChar = section.dataset.gpFocusChar || '';
    const interactive = section.dataset.gpInteractive !== 'false';
    const nextTarget = section.dataset.gpNext || '';

    // Cache elements
    const pin = section.querySelector('[data-gp-pin]');
    const field = section.querySelector('[data-gp-field]');
    const art = section.querySelector('[data-gp-art]');
    let clip = section.querySelector(`#${clipId}`);
    let glyph = section.querySelector('[data-gp-glyph]');
    const marks = section.querySelector('[data-gp-marks]');
    const choices = section.querySelector('[data-gp-choices]');
    const picker = section.querySelector('[data-gp-select]');
    const enterLink = section.querySelector('[data-gp-enter]');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!pin || !field || !art) return;

    // Ensure clipPath structure
    let defs = art.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      art.prepend(defs);
    }
    if (!clip) {
      clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clip.id = clipId;
      clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
      defs.appendChild(clip);
    }
    if (!glyph) {
      glyph = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      glyph.setAttribute('data-gp-glyph', '');
      glyph.setAttribute('x', '0');
      glyph.setAttribute('y', '0');
      clip.appendChild(glyph);
    }
    glyph.textContent = text;
    glyph.style.fontFamily = fontFamily;
    glyph.style.fontWeight = weight;
    glyph.style.fontSize = '100px';
    glyph.style.fontKerning = 'none';
    glyph.style.fontVariantLigatures = 'none';
    glyph.style.letterSpacing = '0';

    // Populate interactive buttons
    if (choices && choices.children.length === 0) {
      let characterOffset = 0;
      Array.from(text).forEach((char, i) => {
        const index = characterOffset;
        characterOffset += char.length;
        if (char === ' ') return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', 'false');
        btn.tabIndex = -1;
        btn.dataset.gpLetter = String(index);
        btn.setAttribute('aria-label', `${char}, letter ${i + 1} of ${text.length}`);
        choices.appendChild(btn);
      });
    }

    if (picker && picker.options.length <= 1) {
      let characterOffset = 0;
      Array.from(text).forEach((char, i) => {
        const index = characterOffset;
        characterOffset += char.length;
        if (char === ' ') return;
        const opt = document.createElement('option');
        opt.value = String(index);
        opt.textContent = `${i + 1} · ${char}`;
        picker.appendChild(opt);
      });
    }

    const buttons = choices ? Array.from(choices.querySelectorAll('button')) : [];

    // Canvas setup
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    let disposed = false, raf = 0, dirty = true, active = true, ready = false;
    const mountedAt = performance.now();
    let browserFrameSeen = false, stalled = false;
    let W = 1, H = 1, travel = 1, startScale = 1, endScale = 1;
    let center = { x: 0, y: 0 }, target = null;
    let lastProgress = -1;
    let candidates = [], letters = [];
    let choosing = false;
    let bounds = { x: 0, y: 0, width: 1, height: 1 };
    let fontDirty = true;

    const readInk = () => {
      if (!context) return false;
      const font = getComputedStyle(glyph);
      const scanFont = `${weight} 300px ${font.fontFamily}`;
      context.font = `${weight} 100px ${font.fontFamily}`;
      context.fontKerning = 'none';
      const metrics = context.measureText(text);
      const advances = Array.from({ length: text.length }, (_, i) => context.measureText(text.slice(0, i)).width);
      bounds = {
        x: -(metrics.actualBoundingBoxLeft || 0),
        y: -(metrics.actualBoundingBoxAscent || 80),
        width: (metrics.actualBoundingBoxLeft || 0) + (metrics.actualBoundingBoxRight || metrics.width),
        height: (metrics.actualBoundingBoxAscent || 80) + (metrics.actualBoundingBoxDescent || 20)
      };
      if (!bounds.width || !bounds.height) return false;
      center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

      const requested = focusChar ? text.indexOf(focusChar.normalize('NFC')) : -1;
      let offset = 0;
      candidates = [];
      letters = [];

      for (const char of Array.from(text)) {
        if (char === ' ') {
          offset += 1;
          continue;
        }
        context.font = `${weight} 100px ${font.fontFamily}`;
        const m = context.measureText(char);
        letters.push({
          index: offset,
          char: char,
          x: advances[offset] - (m.actualBoundingBoxLeft || 0),
          y: -(m.actualBoundingBoxAscent || 80),
          width: (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || m.width),
          height: (m.actualBoundingBoxAscent || 80) + (m.actualBoundingBoxDescent || 20)
        });
        const found = interior(context, char, scanFont);
        if (found) {
          candidates.push({ ...found, x: found.x + advances[offset], index: offset, char: char });
        }
        offset += char.length;
      }

      // Default target: requested char OR largest radius near center
      if (requested >= 0) {
        target = candidates.find(c => c.index === requested) || null;
      }
      if (!target && candidates.length > 0) {
        target = [...candidates].sort((a, b) => (b.radius - a.radius) || (Math.abs(a.x - center.x) - Math.abs(b.x - center.x)))[0];
      }
      if (!target) {
        // Safe procedural fallback if font metrics don't yield raster
        target = { x: center.x, y: center.y, radius: 14, index: 0 };
      }
      return true;
    };

    const select = (next) => {
      target = next || target;
      if (!target) return;
      endScale = target.radius > 0 ? Math.max(startScale, Math.hypot(W, H) / (target.radius * 1.35)) : startScale * 25;
      section.dataset.gpFocus = target.char || '';
      section.dataset.gpFocusIndex = String(target.index);

      for (const button of buttons) {
        const idx = Number(button.dataset.gpLetter);
        const selected = idx === target.index;
        button.disabled = !candidates.some(c => c.index === idx);
        button.setAttribute('aria-checked', String(selected));
        button.tabIndex = selected ? 0 : -1;
      }

      if (picker && picker.value !== '') picker.value = String(target.index);

      if (marks) {
        const u = 1 / startScale;
        const y = bounds.y + bounds.height + 25 * u;
        const x = bounds.x;
        const right = x + bounds.width;
        const cross = target ? `M${target.x - 9 * u} ${target.y}h${18 * u}M${target.x} ${target.y - 9 * u}v${18 * u}` : '';
        const annotationPath = marks.querySelector('path');
        if (annotationPath) {
          annotationPath.setAttribute('d', `M${x} ${y}H${right}M${x} ${y - 5 * u}v${10 * u}M${right} ${y - 5 * u}v${10 * u}${cross}`);
          annotationPath.setAttribute('stroke-width', String(u));
        }
      }
    };

    const position = () => {
      const top = section.getBoundingClientRect().top;
      return clamp(-top / travel);
    };

    const paint = (progress) => {
      const isStatic = motion.matches || !browserFrameSeen || stalled || !target;
      const p = isStatic ? 0 : progress;
      const t = clamp(p / 0.78);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      const scale = Math.exp(Math.log(startScale) + Math.log(endScale / startScale) * eased);
      const blend = endScale === startScale ? 0 : (1 / scale - 1 / startScale) / (1 / endScale - 1 / startScale);
      const cx = center.x + ((target?.x ?? center.x) - center.x) * blend;
      const cy = center.y + ((target?.y ?? center.y) - center.y) * blend;
      const roll = -3.5 * smooth(0.06, 0.5, t) * (1 - smooth(0.62, 0.92, t));

      const radians = (roll * Math.PI) / 180;
      const dx = W / 2 / scale;
      const dy = (H * 0.46 + H * 0.04 * eased) / scale;

      clip.setAttribute('transform', `scale(${scale}) rotate(${roll})`);
      glyph.setAttribute(
        'transform',
        `translate(${Math.cos(radians) * dx + Math.sin(radians) * dy - cx} ${-Math.sin(radians) * dx + Math.cos(radians) * dy - cy})`
      );

      if (marks) {
        marks.setAttribute('transform', `translate(${W / 2} ${H * 0.46 + H * 0.04 * eased}) scale(${scale}) rotate(${roll}) translate(${-cx} ${-cy})`);
        marks.style.opacity = String(1 - smooth(0.015, 0.17, p));
      }

      choosing = interactive && !isStatic && p < 0.04;
      if (choices) choices.inert = !choosing;
      section.dataset.gpChoosing = String(choosing);

      // Once the ink completely fills the screen, drop clipPath for maximum fidelity
      field.style.clipPath = t >= 1 ? 'none' : `url(#${clipId})`;
      section.style.setProperty('--gp-caption', String(1 - smooth(0.01, 0.16, p)));
      section.style.setProperty('--gp-reveal', String(isStatic ? 1 : smooth(0.78, 0.92, p)));
      section.style.setProperty('--gp-field-scale', String(1 + 0.16 * smooth(0, 0.82, p)));
      section.style.setProperty('--gp-caption-hit', p < 0.08 ? 'auto' : 'none');
      section.dataset.gpEntered = String(p >= 0.92);
      section.dataset.gpProgress = p.toFixed(5);
    };

    const layout = () => {
      if (!section.clientWidth) return;
      W = pin.clientWidth || window.innerWidth;
      const smallViewport = section.querySelector('[data-gp-viewport]')?.offsetHeight || window.innerHeight;
      const viewportHeight = Math.max(1, smallViewport);
      H = motion.matches ? Math.min(viewportHeight * 0.75, 480) : viewportHeight;
      section.style.setProperty('--gp-height', `${H}px`);
      travel = H * length;
      art.setAttribute('viewBox', `0 0 ${W} ${H}`);

      if (fontDirty) {
        ready = readInk();
        fontDirty = false;
      }
      if (!ready) return;

      const wordHeight = H < 480 ? Math.min(H * 0.38, Math.max(24, H - 264)) : H * 0.38;
      startScale = Math.min((W * 0.84) / bounds.width, wordHeight / bounds.height);

      select(target);

      for (const button of buttons) {
        const letter = letters.find(item => item.index === Number(button.dataset.gpLetter));
        if (!letter) continue;
        Object.assign(button.style, {
          left: `${W / 2 + (letter.x - center.x) * startScale}px`,
          top: `${H * 0.46 + (letter.y - center.y) * startScale - Math.max(0, 44 - letter.height * startScale) / 2}px`,
          width: `${Math.max(1, letter.width * startScale)}px`,
          height: `${Math.max(44, letter.height * startScale)}px`
        });
      }

      section.style.setProperty('--gp-word-top', `${H * 0.46 - (bounds.height * startScale) / 2}px`);
      section.style.setProperty('--gp-word-bottom', `${H * 0.46 + (bounds.height * startScale) / 2}px`);
      section.dataset.gpReady = 'true';
      section.dataset.gpMotion = !motion.matches && browserFrameSeen && !stalled && target ? 'on' : 'off';
    };

    const frame = (time) => {
      raf = 0;
      if (disposed) return;
      if (time !== undefined && !browserFrameSeen) {
        browserFrameSeen = true;
        stalled = stalled || (performance.now() - mountedAt > 2500);
        dirty = true;
      }
      if (dirty) {
        dirty = false;
        layout();
      }
      if (ready) {
        paint(position());
      }
    };

    const schedule = () => {
      if (!raf && active) raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      cancelAnimationFrame(raf);
      dirty = true;
      frame();
    };

    const onScroll = () => schedule();

    const choose = (event) => {
      if (!choosing || position() >= 0.04) return;
      const button = event.target.closest('[data-gp-letter]');
      if (!button) return;
      const next = candidates.find(c => c.index === Number(button.dataset.gpLetter));
      if (!next || next === target) return;
      select(next);
      paint(position());
    };

    const pick = () => {
      if (!choosing || position() >= 0.04 || !picker) return;
      const next = candidates.find(c => c.index === Number(picker.value));
      if (next) {
        select(next);
        paint(position());
      }
    };

    // Smooth scroll to next section when enter link is clicked
    if (enterLink) {
      enterLink.addEventListener('click', (e) => {
        const targetId = nextTarget || enterLink.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          e.preventDefault();
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            const navH = document.getElementById('nav')?.offsetHeight || 72;
            const top = targetEl.getBoundingClientRect().top + window.scrollY - navH;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
          }
        }
      });
    }

    if (choices) {
      choices.addEventListener('pointerover', choose);
      choices.addEventListener('click', choose);
    }
    if (picker) {
      picker.addEventListener('change', pick);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(section);

    const visibility = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active) {
        dirty = true;
        schedule();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }, { rootMargin: '100% 0px' });
    visibility.observe(section);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    motion.addEventListener('change', resize);

    // Initial frame
    frame();
    schedule();

    // Font ready listener
    if (document.fonts) {
      document.fonts.ready.then(() => {
        fontDirty = true;
        dirty = true;
        schedule();
      });
    }

    section._gpDisposed = () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      visibility.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      motion.removeEventListener('change', resize);
      if (choices) {
        choices.removeEventListener('pointerover', choose);
        choices.removeEventListener('click', choose);
      }
      if (picker) {
        picker.removeEventListener('change', pick);
      }
    };
  }

  window.initGlyphPortals = function() {
    document.querySelectorAll('[data-glyph-portal]').forEach(initSinglePortal);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initGlyphPortals);
  } else {
    window.initGlyphPortals();
  }
})();
