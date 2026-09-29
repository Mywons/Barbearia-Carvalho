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
  // Links keep their real AppBarber destinations if dialog is unsupported.
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

  // Pointer tilt for the hero photo and the team sphere (mouse only).
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

  // Team watch: honeycomb of portraits with a fisheye edge, like a smartwatch
  // home screen. Drag to explore, tap to expand a portrait into the face.
  // Without JavaScript the same list renders as a plain grid with names.
  const watch = document.getElementById('teamWatch');
  if (watch) {
    const face = watch.querySelector('.watch__face');
    const items = [...watch.querySelectorAll('.watch__item')];
    const buttons = items.map((item) => item.querySelector('.pro'));
    const logo = watch.querySelector('.watch__logo');
    const detail = document.getElementById('watchDetail');
    const photo = detail.querySelector('.watch__photo');
    const info = detail.querySelector('.watch__info');
    const nameEl = document.getElementById('watchName');
    const roleEl = document.getElementById('watchRole');
    const ctaLabel = detail.querySelector('.watch__cta-label');
    const closeBtn = detail.querySelector('.watch__close');
    const ease = 'cubic-bezier(.16,1,.3,1)';

    // Axial hex coordinates, ring by ring. Slot 0 (center) holds the logo.
    const hexSlots = (count) => {
      const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
      const slots = [[0, 0]];
      for (let ring = 1; slots.length < count; ring++) {
        let q = -ring, r = ring;
        dirs.forEach(([dq, dr]) => {
          for (let step = 0; step < ring; step++) { slots.push([q, r]); q += dq; r += dr; }
        });
      }
      return slots.slice(0, count);
    };
    const slots = hexSlots(items.length + 1);
    const nodes = [logo, ...items];
    let radius = 0, spacing = 0, limit = 0;
    const base = [];
    const pan = { x: 0, y: 0 };
    const goal = { x: 0, y: 0 };
    let frame = 0;

    watch.classList.add('is-live');
    items.forEach((item, i) => item.querySelector('.pro').style.setProperty('--d', `${0.15 + i * 0.07}s`));

    const place = () => {
      nodes.forEach((node, i) => {
        const x = base[i].x + pan.x;
        const y = base[i].y + pan.y;
        const d = Math.hypot(x, y) / radius;
        // Full size near the middle, shrinking and drawn inward toward the rim.
        const scale = d < 0.7 ? 1 : Math.max(0, 1 - (d - 0.7) / 0.55);
        const pull = d < 0.7 ? 1 : 1 - (d - 0.7) * 0.22;
        node.style.transform = `translate(${(x * pull).toFixed(1)}px, ${(y * pull).toFixed(1)}px) scale(${scale.toFixed(3)})`;
        node.style.opacity = scale < 0.35 ? (scale / 0.35).toFixed(2) : '';
      });
    };
    const tick = () => {
      const k = motion.matches ? 1 : 0.18;
      pan.x += (goal.x - pan.x) * k;
      pan.y += (goal.y - pan.y) * k;
      place();
      if (Math.abs(goal.x - pan.x) > 0.3 || Math.abs(goal.y - pan.y) > 0.3) frame = requestAnimationFrame(tick);
      else { pan.x = goal.x; pan.y = goal.y; place(); frame = 0; }
    };
    const moveTo = (x, y) => {
      const length = Math.hypot(x, y);
      const scale = length > limit ? limit / length : 1;
      goal.x = x * scale;
      goal.y = y * scale;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const layout = () => {
      const size = face.clientWidth;
      if (!size) return;
      radius = size / 2;
      const bubble = size * 0.3;
      spacing = bubble * 1.07;
      face.style.setProperty('--bubble', `${bubble}px`);
      base.length = 0;
      slots.forEach(([q, r]) => base.push({ x: spacing * (q + r / 2), y: spacing * r * Math.sqrt(3) / 2 }));
      limit = Math.max(...base.map((p) => Math.hypot(p.x, p.y)));
      moveTo(goal.x, goal.y);
      place();
    };
    layout();
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(face);
    else window.addEventListener('resize', layout);

    if ('IntersectionObserver' in window) {
      const watchObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        watch.classList.add('is-in');
        watchObserver.disconnect();
      }, { threshold: 0.3 });
      watchObserver.observe(watch);
    } else {
      watch.classList.add('is-in');
    }

    // Drag to pan. A small threshold keeps taps working as clicks.
    let drag = null;
    let suppressClick = false;
    face.addEventListener('pointerdown', (event) => {
      if (watch.classList.contains('is-open') || event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, px: goal.x, py: goal.y, moved: false };
    });
    face.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      if (!drag.moved) { drag.moved = true; face.setPointerCapture(event.pointerId); face.classList.add('is-dragging'); }
      moveTo(drag.px + dx, drag.py + dy);
    });
    const endDrag = () => {
      if (!drag) return;
      suppressClick = drag.moved;
      // The click that ends a drag (if any) fires before this timer.
      if (suppressClick) setTimeout(() => { suppressClick = false; }, 0);
      drag = null;
      face.classList.remove('is-dragging');
    };
    face.addEventListener('pointerup', endDrag);
    face.addEventListener('pointercancel', endDrag);
    face.addEventListener('click', (event) => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }, true);

    // Keyboard focus brings the portrait to the center of the face.
    buttons.forEach((button, i) => {
      button.addEventListener('focus', () => {
        if (!watch.classList.contains('is-open') && button.matches(':focus-visible')) moveTo(-base[i + 1].x, -base[i + 1].y);
      });
    });

    // Expand from the tapped bubble into the whole face.
    let current = -1;
    const fill = (index) => {
      const button = buttons[index];
      const img = button.querySelector('img');
      photo.src = img.currentSrc || img.src;
      photo.alt = `Foto de ${button.dataset.name}`;
      nameEl.textContent = button.dataset.name;
      roleEl.textContent = button.dataset.role;
      ctaLabel.textContent = `Agendar com ${button.dataset.name.split(' ')[0]}`;
    };
    const open = (index) => {
      const button = buttons[index];
      current = index;
      fill(index);
      buttons.forEach((b) => b.setAttribute('aria-expanded', String(b === button)));
      detail.hidden = false;
      watch.classList.add('is-open');
      if (!motion.matches) {
        const faceRect = face.getBoundingClientRect();
        const rect = button.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 - faceRect.left;
        const cy = rect.top + rect.height / 2 - faceRect.top;
        detail.animate([
          { clipPath: `circle(${rect.width / 2}px at ${cx}px ${cy}px)` },
          { clipPath: `circle(71% at ${faceRect.width / 2}px ${faceRect.height / 2}px)` },
        ], { duration: 700, easing: ease });
        photo.animate([{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 900, easing: ease });
        info.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 550, delay: 280, easing: ease, fill: 'backwards' });
      }
      closeBtn.focus({ preventScroll: true });
    };
    const close = () => {
      if (current < 0) return;
      const button = buttons[current];
      const finish = () => {
        detail.hidden = true;
        watch.classList.remove('is-open');
        buttons.forEach((b) => b.setAttribute('aria-expanded', 'false'));
        button.focus({ preventScroll: true });
        current = -1;
      };
      if (motion.matches) { finish(); return; }
      const faceRect = face.getBoundingClientRect();
      const rect = button.getBoundingClientRect();
      watch.classList.remove('is-open');
      detail.animate([
        { clipPath: `circle(71% at ${faceRect.width / 2}px ${faceRect.height / 2}px)` },
        { clipPath: `circle(${rect.width / 2}px at ${rect.left + rect.width / 2 - faceRect.left}px ${rect.top + rect.height / 2 - faceRect.top}px)` },
      ], { duration: 480, easing: 'cubic-bezier(.5,0,.2,1)' }).finished.then(finish, finish);
    };
    const step = (delta) => {
      const next = (current + delta + buttons.length) % buttons.length;
      current = next;
      buttons.forEach((b, i) => b.setAttribute('aria-expanded', String(i === next)));
      moveTo(-base[next + 1].x, -base[next + 1].y);
      if (motion.matches) { fill(next); return; }
      const out = { opacity: 0, transform: `translateX(${delta * -40}px) scale(1.05)` };
      Promise.all([
        photo.animate([{ opacity: 1, transform: 'none' }, out], { duration: 220, easing: 'ease-in' }).finished,
        info.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180 }).finished,
      ]).then(() => {
        fill(next);
        photo.animate([{ opacity: 0, transform: `translateX(${delta * 40}px) scale(1.05)` }, { opacity: 1, transform: 'none' }], { duration: 520, easing: ease });
        info.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 450, delay: 80, easing: ease, fill: 'backwards' });
      });
    };
    buttons.forEach((button, i) => button.addEventListener('click', () => open(i)));
    closeBtn.addEventListener('click', close);
    detail.querySelector('.watch__nav--prev').addEventListener('click', () => step(-1));
    detail.querySelector('.watch__nav--next').addEventListener('click', () => step(1));
    detail.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { event.stopPropagation(); close(); }
      if (event.key === 'ArrowLeft') step(-1);
      if (event.key === 'ArrowRight') step(1);
    });
  }

  // Kids: the lion follows the pointer with its eyes and answers a tap.
  const lionBtn = document.getElementById('lionBtn');
  const bubble = document.getElementById('lionBubble');
  if (lionBtn) {
    const pupils = lionBtn.querySelector('.lion__pupils');
    const lines = ['Oi! Bora cortar?', 'Juba no capricho!', 'Hoje tem corte novo!', 'Pode sentar, a casa é sua!'];
    let turn = 0;
    let bubbleTimer = 0;
    window.addEventListener('pointermove', (event) => {
      if (!pupils || motion.matches) return;
      const rect = lionBtn.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height * 0.55);
      const distance = Math.hypot(dx, dy) || 1;
      const reach = Math.min(distance / 40, 7);
      pupils.style.transform = `translate(${(dx / distance) * reach}px, ${(dy / distance) * reach}px)`;
    }, { passive: true });
    lionBtn.addEventListener('click', () => {
      lionBtn.classList.remove('is-happy');
      void lionBtn.offsetWidth;
      lionBtn.classList.add('is-happy');
      if (bubble) {
        bubble.textContent = lines[turn++ % lines.length];
        bubble.classList.add('is-on');
        clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(() => bubble.classList.remove('is-on'), 2600);
      }
    });
  }
})();
