/* ==========================================================================
   ARTAFIC ABOUT PAGE — INTERACTION & SCROLL ENGINE (EDITORIAL)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ── 1. Magnetic CTA Button ── */
    const magneticBtn = document.querySelector('.ed-magnetic-btn');
    if (magneticBtn) {
      magneticBtn.addEventListener('mousemove', (e) => {
        const rect = magneticBtn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Move button slightly towards cursor
        magneticBtn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        
        // Move the text inside even more to create parallax
        const text = magneticBtn.querySelector('.ed-magnetic-btn__text');
        if (text) {
          text.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        }
      });
  
      magneticBtn.addEventListener('mouseleave', () => {
        // Reset transforms
        magneticBtn.style.transform = `translate(0px, 0px)`;
        const text = magneticBtn.querySelector('.ed-magnetic-btn__text');
        if (text) {
          text.style.transform = `translate(0px, 0px)`;
        }
      });
    }
  
    /* ── 2. Standard Scroll Reveal (fade-up) ── */
    const fadeElements = document.querySelectorAll('.fade-up');
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    fadeElements.forEach(el => fadeObserver.observe(el));
  
    /* ── 3. Kinetic Text Reveal ── */
    const kineticTexts = document.querySelectorAll('.kinetic-text');
    const kineticObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease';
          entry.target.style.transform = 'translateY(0)';
          entry.target.style.opacity = '1';
          kineticObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    // Stagger slightly if in same container
    let delay = 0;
    kineticTexts.forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.1}s`;
      kineticObserver.observe(el);
    });
  
    /* ── 4. Scroll-driven Line Draw (Why ARTAFIC Exists) ── */
    const lineFill = document.querySelector('.ed-why__line-fill');
    const blocksContainer = document.querySelector('.ed-why__blocks');
    
    if (lineFill && blocksContainer) {
      window.addEventListener('scroll', () => {
        const rect = blocksContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate how far we've scrolled through the container
        // Start drawing when the top of the container hits the middle of the screen
        let progress = (windowHeight / 2 - rect.top) / rect.height;
        
        // Clamp between 0 and 1
        progress = Math.max(0, Math.min(1, progress));
        
        lineFill.style.height = `${progress * 100}%`;
      });
    }
  
    /* ── 5. Sticky Philosophy Scroll Active States ── */
    const philItems = document.querySelectorAll('.ed-phil-item');
    const philObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
        } else {
          // If we want it to fade out when leaving center screen:
          // entry.target.classList.remove('is-active');
        }
      });
    }, { threshold: 0.6, rootMargin: '-20% 0px -20% 0px' });
    
    philItems.forEach(item => philObserver.observe(item));
  
    /* ── 6. Manifesto Blur/Focus Scroll ── */
    const manifestoItems = document.querySelectorAll('.ed-manifesto-item');
    const manifestoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
        } else {
          entry.target.classList.remove('is-active');
        }
      });
    }, { threshold: 0.5, rootMargin: '-25% 0px -25% 0px' });
    
    manifestoItems.forEach(item => manifestoObserver.observe(item));
  
    /* ── 7. Signature "LESS NOISE" Preserved Animation ── */
    const lessNoiseSection = document.getElementById('less-noise');
    const word1 = document.querySelector('.less-noise__word1');
    const word2 = document.querySelector('.less-noise__word2');
    
    if (lessNoiseSection && word1 && word2) {
      window.addEventListener('scroll', () => {
        const rect = lessNoiseSection.getBoundingClientRect();
        const centerOffset = window.innerHeight / 2 - (rect.top + rect.height / 2);
        
        // Calculate parallax displacement
        const yOffset1 = centerOffset * 0.15;
        const yOffset2 = centerOffset * -0.15;
        
        word1.style.transform = `translate(-50%, calc(-50% + ${yOffset1}px))`;
        word2.style.transform = `translate(-50%, calc(-50% + ${yOffset2}px))`;
        
        // Fade logic based on center proximity
        const distanceToCenter = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
        const maxDistance = window.innerHeight;
        let opacity = 1 - (distanceToCenter / maxDistance);
        opacity = Math.max(0, Math.min(1, opacity));
        
        word1.style.opacity = opacity;
        word2.style.opacity = opacity;
      });
    }
  
  });
