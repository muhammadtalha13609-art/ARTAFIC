(function initAboutPage() {
  // SVG Path Generator mimicking Framer Motion logic
  function createPathsSVG(position, themeMode) {
    let paths = '';
    const numPaths = window.innerWidth < 768 ? 18 : 36; // Optimize for mobile
    
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
    return `<svg class="fp-svg" viewBox="0 0 696 316" preserveAspectRatio="xMidYMid slice">${paths}</svg>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    
    // Inject Floating Paths
    document.querySelectorAll('.floating-paths-bg').forEach(container => {
      const pos = parseFloat(container.dataset.pos || '1');
      const theme = container.dataset.theme || 'normal';
      container.innerHTML = createPathsSVG(pos, theme);
    });

    // 1. Initial Page Reveal
    setTimeout(() => {
      document.querySelectorAll('.about-intro .reveal-text-inner, .about-intro .fade-up, .about-intro__scroll').forEach(el => {
        el.classList.add('is-revealed');
      });
    }, 100);

    // 2. Generic Scroll Reveal Observer
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -15% 0px', threshold: 0.1 });

    document.querySelectorAll('.reveal-text-inner:not(.about-intro *), .fade-up:not(.about-intro *)').forEach(el => {
      revealObserver.observe(el);
    });

    // 3. Why Exists Line Progress
    const whyExists = document.querySelector('.why-exists');
    const whyLineFill = document.querySelector('.why-exists__line-fill');
    
    // 4. Story & Beliefs Active Items
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
    
    const beliefObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
          entry.target.classList.add('is-active');
        } else if (entry.intersectionRatio < 0.2) {
          entry.target.classList.remove('is-active');
        }
      });
    }, { rootMargin: '-20% 0px -20% 0px', threshold: [0.2, 0.5] });
    
    document.querySelectorAll('.belief-row').forEach(el => beliefObserver.observe(el));

    // Philosophy Highlights Observer
    const philTitles = document.querySelectorAll('.phil-title');
    const philDescs = document.querySelectorAll('.phil-desc');
    const philObserver = new IntersectionObserver((entries) => {
      let activeIndex = -1;
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          activeIndex = parseInt(entry.target.dataset.index);
        }
      });
      if(activeIndex !== -1) {
        philTitles.forEach((t, i) => t.classList.toggle('is-active', i === activeIndex));
        philDescs.forEach((d, i) => d.classList.toggle('is-active', i === activeIndex));
      }
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0.1 });
    
    philDescs.forEach(el => philObserver.observe(el));

    // Scroll Handler for specific parallax fx
    const lessNoiseSec = document.querySelector('.less-noise');
    const word1 = document.querySelector('.less-noise__word1');
    const word2 = document.querySelector('.less-noise__word2');
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const winH = window.innerHeight;

          // Why Exists Line
          if (whyExists && whyLineFill) {
            const rect = whyExists.getBoundingClientRect();
            if (rect.top < winH / 2 && rect.bottom > 0) {
              let progress = (winH / 2 - rect.top) / (rect.height);
              progress = Math.max(0, Math.min(1, progress));
              whyLineFill.style.height = `${progress * 100}%`;
            }
          }

          // Less Noise Transition
          if (lessNoiseSec && word1 && word2) {
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
          
          // Generic Parallax
          parallaxEls.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
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
