(() => {
  'use strict';
  window.BC_READY = true;
  const root = document.documentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 900px)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Progressive navigation: all links remain available when JavaScript is off.
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const links = document.getElementById('navLinks');
  if (nav && burger && links) {
    nav.classList.add('nav--enhanced');
    burger.hidden = false;
    const closeMenu = (restoreFocus = false) => {
      links.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menu');
      if (restoreFocus) burger.focus();
    };
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') !== 'true';
      links.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    links.addEventListener('click', (event) => {
      if (!event.target.closest('a')) return;
      if (mobile.matches) closeMenu(true);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && links.classList.contains('is-open')) closeMenu(true);
    });
    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target)) closeMenu();
    });
    nav.addEventListener('focusout', (event) => {
      if (event.relatedTarget && !nav.contains(event.relatedTarget)) closeMenu();
    });
    mobile.addEventListener('change', () => closeMenu());
  }

  // Native modal provides focus containment and makes the background inert.
  // Links keep the real online booking URL if dialog is unsupported.
  const modal = document.getElementById('appModal');
  if (modal && typeof modal.showModal === 'function') {
    let opener = null;
    let previousOverflow = '';
    document.querySelectorAll('[data-open-modal]').forEach((link) => {
      link.addEventListener('click', (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        if (modal.open) return;
        opener = link;
        previousOverflow = document.body.style.overflow;
        modal.showModal();
        document.body.style.overflow = 'hidden';
      });
    });
    modal.querySelector('[data-close-modal]')?.addEventListener('click', () => modal.close());
    modal.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const focusable = [...modal.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')]
        .filter((element) => element.getClientRects().length);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    });
    modal.addEventListener('click', (event) => {
      if (event.target !== modal) return;
      const rect = modal.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
    });
    modal.addEventListener('close', () => {
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus();
    });
  }

  // Headings marked data-split rise word by word. Text stays in the DOM in order.
  const splitWords = (element) => {
    let index = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = child.textContent.split(/(\s+)/);
          const fragment = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { fragment.append(part); return; }
            const outer = document.createElement('span');
            const inner = document.createElement('span');
            outer.className = 'w';
            inner.textContent = part;
            inner.style.setProperty('--i', index++);
            outer.append(inner);
            fragment.append(outer);
          });
          child.replaceWith(fragment);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(element);
  };
  document.querySelectorAll('[data-split]').forEach(splitWords);

  // Stagger siblings inside data-stagger groups.
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    group.querySelectorAll('[data-reveal]').forEach((item, i) => {
      if (!item.style.getPropertyValue('--d')) item.style.setProperty('--d', `${Math.min(i, 8) * 0.09}s`);
    });
  });

  // Scroll reveals. Content is only hidden while <html> has .motion.
  const revealables = document.querySelectorAll('[data-reveal],[data-split],[data-draw]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    revealables.forEach((element) => revealObserver.observe(element));
  } else {
    revealables.forEach((element) => element.classList.add('is-in'));
  }

  const allowMotion = () => !motion.matches;

  // Nav hides on scroll down, returns on scroll up; progress bar under it.
  const progress = document.createElement('span');
  progress.className = 'nav__progress';
  progress.setAttribute('aria-hidden', 'true');
  nav?.append(progress);

  // Marquee: runs continuously, speeds up and follows scroll direction.
  const marquee = document.querySelector('.marquee');
  let marqueeAnim = null;
  if (marquee && 'animate' in marquee) {
    const track = marquee.querySelector('.marquee__track');
    track.append(...[...track.children].map((node) => node.cloneNode(true)));
    marquee.classList.add('is-live');
    marqueeAnim = track.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 38000, iterations: Infinity });
    if (motion.matches) marqueeAnim.pause();
    motion.addEventListener('change', () => (motion.matches ? marqueeAnim.pause() : marqueeAnim.play()));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (motion.matches) return;
        entry.isIntersecting ? marqueeAnim.play() : marqueeAnim.pause();
      }).observe(marquee);
    }
  }

  let lastY = window.scrollY;
  let direction = 1;
  let velocity = 0;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const delta = y - lastY;
    lastY = y;
    if (Math.abs(delta) > 2) direction = delta > 0 ? 1 : -1;
    velocity = Math.min(Math.abs(delta) / 12, 5);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
    if (nav) {
      const menuOpen = links?.classList.contains('is-open');
      const hide = allowMotion() && !menuOpen && y > 420 && direction > 0 && !nav.contains(document.activeElement);
      nav.classList.toggle('is-hidden', hide);
    }
    if (marqueeAnim && allowMotion()) marqueeAnim.updatePlaybackRate(direction * (1 + velocity));
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  // Ease the marquee back to cruising speed once scrolling stops.
  setInterval(() => {
    if (!marqueeAnim || !allowMotion() || velocity === 0) return;
    velocity = velocity < 0.1 ? 0 : velocity * 0.6;
    marqueeAnim.updatePlaybackRate(direction * (1 + velocity));
  }, 120);
  onScroll();

  // Current section highlight in the main navigation.
  const sectionLinks = links ? [...links.querySelectorAll('a[href^="#"]')] : [];
  if (sectionLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(sectionLinks.map((link) => [link.getAttribute('href').slice(1), link]));
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = byId.get(entry.target.id);
        if (link) link.classList.toggle('is-active', entry.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const section = document.getElementById(id); if (section) sectionObserver.observe(section); });
  }

  // Pointer tilt for the hero photo (mouse only).
  const tilt = (area, target, prefix) => {
    if (!area || !target) return;
    area.addEventListener('pointermove', (event) => {
      if (!finePointer.matches || motion.matches) return;
      const rect = area.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      target.style.setProperty(`--${prefix}x`, x.toFixed(3));
      target.style.setProperty(`--${prefix}y`, y.toFixed(3));
    });
    area.addEventListener('pointerleave', () => {
      target.style.setProperty(`--${prefix}x`, 0);
      target.style.setProperty(`--${prefix}y`, 0);
    });
  };
  tilt(document.querySelector('.hero'), document.querySelector('[data-tilt]'), 'p');


  // Kids: o leão (estático) troca de expressão ao toque
  // e cochila fora do horário de atendimento (9h às 18h).
  const lionBtn = document.getElementById('lionBtn');
  const lionImg = document.getElementById('lionImg');
  const bubble = document.getElementById('lionBubble');
  if (lionBtn && lionImg) {
    const path = (name) => `assets/img/leao/${name}.webp`;
    const alts = {
      oi: 'Leãozinho da Carvalho, de capa e gravatinha, acenando',
      sono: 'Leãozinho da Carvalho bocejando de sono',
      feliz: 'Leãozinho da Carvalho sorrindo de olhos fechados',
      piscadinha: 'Leãozinho da Carvalho piscando e fazendo joinha',
      gargalhada: 'Leãozinho da Carvalho dando risada',
      surpreso: 'Leãozinho da Carvalho surpreso',
      orgulhoso: 'Leãozinho da Carvalho se olhando no espelho',
    };
    const hour = new Date().getHours();
    const resting = hour < 9 || hour >= 18 ? 'sono' : 'oi';
    const reactions = resting === 'sono'
      ? [['surpreso', 'Opa! Acordei!'], ['feliz', 'A gente abre às 9h!'], ['piscadinha', 'Agenda já pra amanhã!']]
      : [['feliz', 'Oi! Bora cortar?'], ['piscadinha', 'Juba no capricho!'], ['gargalhada', 'Hoje tem corte novo!'], ['orgulhoso', 'Olha esse topete!']];
    Object.keys(alts).forEach((name) => { const img = new Image(); img.src = path(name); });
    let turn = 0;
    let resetTimer = 0;
    const show = (name) => {
      if (lionImg.getAttribute('src') === path(name)) return;
      lionImg.classList.add('is-swapping');
      setTimeout(() => {
        lionImg.src = path(name);
        lionImg.alt = alts[name];
        lionImg.classList.remove('is-swapping');
      }, motion.matches ? 0 : 150);
    };
    show(resting);
    lionBtn.addEventListener('click', () => {
      const [face, line] = reactions[turn++ % reactions.length];
      show(face);
      if (bubble) {
        bubble.textContent = line;
        bubble.classList.add('is-on');
      }
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        bubble?.classList.remove('is-on');
        show(resting);
      }, 2600);
    });
  }

  // Vídeos curtos: tocam sem som quando visíveis; botão de pausa por vídeo.
  // Sem JS ou com movimento reduzido, ficam parados com os controles nativos.
  const clips = document.querySelectorAll('.tour__item video,.hero__video');
  if (clips.length && 'IntersectionObserver' in window && !motion.matches) {
    const paused = new WeakSet();
    const clipObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting && !paused.has(target) && !document.hidden) target.play().catch(() => {});
        else target.pause();
      });
    }, { threshold: 0.5 });
    clips.forEach((video) => {
      video.controls = false;
      video.preload = 'metadata';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'tour__toggle';
      const sync = () => {
        const off = paused.has(video);
        toggle.setAttribute('aria-label', off ? 'Reproduzir vídeo' : 'Pausar vídeo');
        toggle.textContent = off ? '▶' : '❚❚';
      };
      toggle.addEventListener('click', () => {
        if (paused.has(video)) { paused.delete(video); video.play().catch(() => {}); }
        else { paused.add(video); video.pause(); }
        sync();
      });
      sync();
      video.after(toggle);
      clipObserver.observe(video);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clips.forEach((v) => v.pause());
    });
  }
})();
