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

  /* ---------- Nav scroll state + scroll progress bar ---------- */
  const nav = document.getElementById('nav');
  const scrollProgress = document.getElementById('scrollProgress');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
    if (scrollProgress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      scrollProgress.style.width = pct + '%';
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

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

  /* ---------- Título palavra por palavra ----------
     Quebra os .section-title em <span class="word"><span>palavra</span></span>
     para cada palavra poder subir de trás de uma máscara. Só mexe em nós de
     texto: os <span class="text-ink"> internos continuam intactos. */
  const splitWords = (root) => {
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = child.textContent.split(/(\s+)/);
          if (!parts.some((p) => p.trim())) return;
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part.trim()) {
              frag.appendChild(document.createTextNode(part));
              return;
            }
            const outer = document.createElement('span');
            outer.className = 'word';
            const inner = document.createElement('span');
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(root);
    // índice sequencial para o atraso em cascata
    root.querySelectorAll('.word > span').forEach((s, i) => {
      s.style.setProperty('--wi', i);
    });
  };

  if (!reduceMotion) {
    document.querySelectorAll('.section-title, .cta-final h2').forEach(splitWords);
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal], [data-wipe], .section-title, .cta-final h2');
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

  /* ---------- Hero mouse parallax (desktop, fine-pointer only) ---------- */
  const heroSection = document.getElementById('hero');
  const heroContent = document.querySelector('.hero__content');
  if (heroSection && heroContent && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    let hpX = 0, hpY = 0, hpTargetX = 0, hpTargetY = 0;
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      hpTargetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      hpTargetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });
    heroSection.addEventListener('mouseleave', () => { hpTargetX = 0; hpTargetY = 0; });
    const tickHeroParallax = () => {
      hpX += (hpTargetX - hpX) * 0.06;
      hpY += (hpTargetY - hpY) * 0.06;
      heroContent.style.transform = `translate(${(-hpX * 14).toFixed(2)}px, ${(-hpY * 10).toFixed(2)}px)`;
      requestAnimationFrame(tickHeroParallax);
    };
    requestAnimationFrame(tickHeroParallax);
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
  /* Marrom do logo, não mais preto */
  const confettiColors = ['#43291c', '#2a1810', '#fff0b8', '#563a28'];
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

  /* ---------- 3D tilt on cards & gallery items ----------
     Escreve em custom properties em vez de `transform`: o CSS compõe o tilt
     do mouse com a inclinação-base do grid quebrado (--tilt/--shift). Se
     escrevesse `transform` direto, o hover apagaria a inclinação-base e o
     card endireitaria de repente. */
  if (!reduceMotion) {
    document.querySelectorAll('.card, .gallery-item, .team-card').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transition = 'transform 0.08s linear';
        el.style.setProperty('--tx', (-py * 9).toFixed(2) + 'deg');
        el.style.setProperty('--ty', (px * 9).toFixed(2) + 'deg');
        el.style.setProperty('--lift', '-6px');
        el.style.setProperty('--pop', '1.015');
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.6s var(--ease-bounce)';
        el.style.setProperty('--tx', '0deg');
        el.style.setProperty('--ty', '0deg');
        el.style.setProperty('--lift', '0px');
        el.style.setProperty('--pop', '1');
      });
    });
  }

  /* ---------- Magnetic buttons ----------
     Escreve em --mx/--my em vez de `transform`, para o CSS poder compor o
     ímã com o gel do :hover/:active em vez de um sobrescrever o outro. */
  if (!reduceMotion) {
    document.querySelectorAll('.btn, .fab').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.setProperty('--mx', (x * 0.22).toFixed(1) + 'px');
        el.style.setProperty('--my', (y * 0.35).toFixed(1) + 'px');
      });
      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });
  }

  /* ---------- Cursor líquido (desktop, ponteiro fino) ----------
     Gota + rastro com lerps diferentes: quando o mouse corre, os dois se
     afastam e o filtro goo os estica como líquido; parados, se fundem numa
     gota só. A deformação vem da velocidade real entre frames. */
  const liquidCursor = document.getElementById('liquidCursor');
  if (liquidCursor && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    const dot = liquidCursor.querySelector('.liquid-cursor__dot');
    const trail = liquidCursor.querySelector('.liquid-cursor__trail');

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let dotX = targetX, dotY = targetY;
    let trailX = targetX, trailY = targetY;
    let active = false;

    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!active) { active = true; liquidCursor.classList.add('is-active'); }
    });
    document.addEventListener('mouseleave', () => {
      active = false;
      liquidCursor.classList.remove('is-active');
    });

    const tick = () => {
      const prevX = dotX, prevY = dotY;

      dotX += (targetX - dotX) * 0.35;
      dotY += (targetY - dotY) * 0.35;
      trailX += (dotX - trailX) * 0.14;
      trailY += (dotY - trailY) * 0.14;

      const vx = dotX - prevX;
      const vy = dotY - prevY;
      const speed = Math.min(Math.hypot(vx, vy), 60);
      const angle = (Math.atan2(vy, vx) * 180) / Math.PI;

      dot.style.transform =
        `translate(${dotX.toFixed(1)}px, ${dotY.toFixed(1)}px) rotate(${angle.toFixed(1)}deg)` +
        ` scale(${(1 + speed / 55).toFixed(3)}, ${(1 - speed / 130).toFixed(3)})`;
      trail.style.transform =
        `translate(${trailX.toFixed(1)}px, ${trailY.toFixed(1)}px) rotate(${angle.toFixed(1)}deg)` +
        ` scale(${(1 + speed / 90).toFixed(3)}, ${(1 - speed / 160).toFixed(3)})`;

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Button ripple ---------- */
  if (!reduceMotion) {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'btn__ripple';
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }
})();
