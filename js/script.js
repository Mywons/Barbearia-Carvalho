(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader ---------- */
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => preloader.classList.add('is-done'), reduceMotion ? 0 : 500);
  });

  /* ---------- Year in footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ---------- Ambiente parallax ---------- */
  const ambienteBg = document.querySelector('.ambiente__bg');
  if (ambienteBg && !reduceMotion) {
    const section = document.getElementById('ambiente');
    let ticking = false;
    const updateParallax = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom > 0 && rect.top < vh) {
        const progress = (vh - rect.top) / (vh + rect.height);
        const shift = (progress - 0.5) * 60;
        ambienteBg.style.transform = `translateY(${shift}px) scale(1.15)`;
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
    }, { passive: true });
    updateParallax();
  }

  /* ---------- Video slot: auto-detect if a real video file was added ---------- */
  const tourVideo = document.getElementById('tourVideo');
  const tourPlayBtn = document.getElementById('tourPlayBtn');
  const tourTag = document.getElementById('tourTag');
  const tourItem = tourVideo ? tourVideo.closest('.gallery-item') : null;

  if (tourVideo && tourPlayBtn) {
    const source = tourVideo.querySelector('source');
    const videoSrc = source.getAttribute('data-src');

    fetch(videoSrc, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          source.setAttribute('src', videoSrc);
          tourVideo.load();
          tourPlayBtn.disabled = false;
          tourTag.textContent = 'Vídeo da casa';
        }
      })
      .catch(() => { /* video not available yet — placeholder stays */ });

    tourPlayBtn.addEventListener('click', () => {
      if (tourPlayBtn.disabled) return;
      if (tourVideo.paused) {
        tourVideo.play();
        tourItem.classList.add('is-playing');
      } else {
        tourVideo.pause();
        tourItem.classList.remove('is-playing');
      }
    });
    tourVideo.addEventListener('ended', () => tourItem.classList.remove('is-playing'));
  }

  /* ---------- Floating CTA visibility ---------- */
  const fab = document.getElementById('fabBtn');
  const hero = document.getElementById('hero');
  if (fab && hero) {
    const heroIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => fab.classList.toggle('is-visible', !entry.isIntersecting));
      },
      { threshold: 0 }
    );
    heroIO.observe(hero);
  }

  /* ---------- Confetti burst ---------- */
  const confettiColors = ['#f3c135', '#ffdd6b', '#f7f3e9', '#c9932a'];
  const burstConfetti = (x, y) => {
    if (reduceMotion) return;
    const count = 26;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.background = confettiColors[i % confettiColors.length];
      piece.style.left = x + 'px';
      piece.style.top = y + 'px';
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 150;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 50;
      const rot = Math.random() * 720 - 360;
      piece.style.setProperty('--dx', dx + 'px');
      piece.style.setProperty('--dy', dy + 'px');
      piece.style.setProperty('--rot', rot + 'deg');
      document.body.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove());
    }
  };

  /* ---------- Modal ---------- */
  const modal = document.getElementById('appModal');
  let lastFocused = null;

  const openModal = (e) => {
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();

    const originX = e && typeof e.clientX === 'number' && e.clientX !== 0 ? e.clientX : window.innerWidth / 2;
    const originY = e && typeof e.clientY === 'number' && e.clientY !== 0 ? e.clientY : window.innerHeight / 2;
    burstConfetti(originX, originY);
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  };

  document.querySelectorAll('[data-open-modal]').forEach((btn) => {
    btn.addEventListener('click', openModal);
  });
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  /* Auto-open once per session, after a short delay */
  const AUTO_OPEN_KEY = 'bc_modal_auto_shown';
  if (!sessionStorage.getItem(AUTO_OPEN_KEY)) {
    setTimeout(() => {
      if (!modal.classList.contains('is-open')) {
        openModal();
        sessionStorage.setItem(AUTO_OPEN_KEY, '1');
      }
    }, 14000);
  }

  /* ---------- 3D tilt on cards & gallery items ---------- */
  if (!reduceMotion) {
    document.querySelectorAll('.card, .gallery-item').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transition = 'transform 0.08s linear';
        el.style.transform = `perspective(800px) rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) translateY(-6px) scale(1.015)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.6s var(--ease-bounce)';
        el.style.transform = '';
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (!reduceMotion) {
    document.querySelectorAll('.btn--gold, .btn--ghost, .btn--outline, .fab').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transition = 'transform 0.12s linear';
        el.style.transform = `translate(${(x * 0.22).toFixed(1)}px, ${(y * 0.35).toFixed(1)}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.5s var(--ease-bounce)';
        el.style.transform = '';
      });
    });
  }

  /* ---------- Count-up numbers ---------- */
  const countEls = document.querySelectorAll('[data-count-to]');
  if (countEls.length) {
    const runCount = (el) => {
      const target = parseInt(el.dataset.countTo, 10);
      const prefix = el.dataset.countPrefix || '';
      if (reduceMotion) { el.textContent = prefix + target; return; }
      const duration = 1200;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCount(entry.target);
          countIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    countEls.forEach((el) => countIO.observe(el));
  }
})();
