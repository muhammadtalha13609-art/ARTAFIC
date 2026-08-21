(function initAboutPage() {
  document.addEventListener('DOMContentLoaded', () => {
    
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
    
    // 4. Story Active Items
    const storyItems = document.querySelectorAll('.story-item');
    const storyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          entry.target.classList.add('is-active');
        } else if (entry.intersectionRatio < 0.1) {
          entry.target.classList.remove('is-active');
        }
      });
    }, { rootMargin: '-10% 0px -30% 0px', threshold: [0.1, 0.4] });
    
    storyItems.forEach(el => storyObserver.observe(el));

    // 5. Beliefs Observer
    const beliefRows = document.querySelectorAll('.belief-row');
    const beliefObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
          entry.target.classList.add('is-active');
        } else {
          entry.target.classList.remove('is-active');
        }
      });
    }, { rootMargin: '-20% 0px -30% 0px', threshold: [0, 0.5] });
    
    beliefRows.forEach(el => beliefObserver.observe(el));

    // DOM Elements for scroll listener
    const philosophySec = document.querySelector('.philosophy');
    const philTitles = document.querySelectorAll('.philosophy__title');
    const philDescs = document.querySelectorAll('.philosophy__desc');
    
    const lessNoiseSec = document.querySelector('.less-noise');
    const word1 = document.querySelector('.less-noise__word1');
    const word2 = document.querySelector('.less-noise__word2');
    const lessSub = document.querySelector('.less-noise__sub');
    
    const parallaxEls = document.querySelectorAll('[data-parallax]');

    // Scroll Handler for specific sticky/parallax fx
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const winH = window.innerHeight;

      // Why Exists Line
      if (whyExists && whyLineFill) {
        const rect = whyExists.getBoundingClientRect();
        if (rect.top < winH / 2 && rect.bottom > 0) {
          let progress = (winH / 2 - rect.top) / (rect.height);
          progress = Math.max(0, Math.min(1, progress));
          whyLineFill.style.height = ${progress * 100}%;
        }
      }

      // Philosophy Sticky
      if (philosophySec && philTitles.length) {
        const rect = philosophySec.getBoundingClientRect();
        if (rect.top < 0 && rect.bottom > winH) {
          const progress = Math.abs(rect.top) / (rect.height - winH);
          let activeIndex = 0;
          if (progress > 0.33) activeIndex = 1;
          if (progress > 0.66) activeIndex = 2;
          
          philTitles.forEach((t, i) => t.classList.toggle('is-active', i === activeIndex));
          philDescs.forEach((d, i) => d.classList.toggle('is-active', i === activeIndex));
        } else if (rect.top >= 0) {
          // default first active if above
          philTitles.forEach((t, i) => t.classList.toggle('is-active', i === 0));
          philDescs.forEach((d, i) => d.classList.toggle('is-active', i === 0));
        }
      }

      // Less Noise Sticky
      if (lessNoiseSec && word1 && word2) {
        const rect = lessNoiseSec.getBoundingClientRect();
        if (rect.top < 0 && rect.bottom > winH) {
          const progress = Math.abs(rect.top) / (rect.height - winH);
          if (progress < 0.4) {
            word1.style.opacity = 1 - (progress * 2.5);
            word2.style.opacity = 0;
            word2.style.transform = 'translate(-50%, -50%) scale(0.9)';
            lessSub.style.opacity = 0;
          } else {
            word1.style.opacity = 0;
            const p2 = (progress - 0.4) / 0.6; // 0 to 1
            word2.style.opacity = p2 * 1.5;
            word2.style.transform = 	ranslate(-50%, -50%) scale();
            lessSub.style.opacity = p2 * 1.2;
            lessSub.style.transform = 	ranslateX(-50%) translateY(px);
          }
        } else if (rect.top >= 0) {
          word1.style.opacity = 1;
          word2.style.opacity = 0;
          lessSub.style.opacity = 0;
        }
      }
      
      // Generic Parallax
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        const rect = el.getBoundingClientRect();
        if (rect.top < winH && rect.bottom > 0) {
          const yPos = (rect.top - winH/2) * speed;
          el.style.transform = 	ranslateY(px);
        }
      });
      
    }, { passive: true });
    
    // Trigger scroll once
    window.dispatchEvent(new Event('scroll'));
  });
})();
