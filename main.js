/* =========================================================
   Compositions: Design Battles - motion layer

   The page is scroll-led. Almost everything here is scrubbed by
   scroll position rather than fired once, so the whole thing
   responds continuously as you move:

     hero       -> type layers separate, glass letter drifts and turns
     ticker     -> constant, carries the six event names
     manifesto  -> words ink in at reading pace
     main stage -> pinned sequence: word pans, image wipes open, facts land
     battles    -> sticky stack, each card shrinks under the next
     prizes     -> image parallax, podium rows slide in on scrub
     footer     -> wordmark skews back to upright
   ========================================================= */

gsap.registerPlugin(ScrollTrigger, Draggable);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const DESKTOP = window.matchMedia('(min-width: 900px)').matches;

/* ---------------------------------------------------------
   Smooth scroll
   --------------------------------------------------------- */
let lenis = null;
if (!REDUCED && window.Lenis) {
  lenis = new Lenis({ duration: 1.05, smoothWheel: true, lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis;
}

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -50 });
    else target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
  });
});

/* Skew lives in GSAP as well as CSS, so tweens compose with it
   instead of wiping it off the element. */
gsap.set('.stack .line', { skewX: -9 });
gsap.set('.glass', { yPercent: -50 });

if (FINE && !REDUCED) document.body.classList.add('has-cursor');

/* ---------------------------------------------------------
   Hero
   --------------------------------------------------------- */
if (!REDUCED) {
  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .from('.hero__meta span', { y: -10, opacity: 0, duration: 0.6, stagger: 0.06 })
    .from('.stack .line', { yPercent: 55, opacity: 0, duration: 1, stagger: 0.09 }, 0.1)
    .from('.glass', { scale: 0.86, opacity: 0, duration: 1.2, ease: 'power3.out' }, 0.3)
    .from('.hero__foot > *', { y: 12, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.5);

  // Layers pull apart as the hero leaves.
  gsap.utils.toArray('.hero [data-depth]').forEach((el) => {
    gsap.to(el, {
      y: () => parseFloat(el.dataset.depth) * 2.6,
      ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.7 }
    });
  });

  // The glass letter turns and sinks, so it reads as a solid object in space.
  gsap.to('#glass', {
    y: 140,
    rotate: -12,
    scale: 1.18,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.8 }
  });
}

/* ---------------------------------------------------------
   Cursor
   --------------------------------------------------------- */
if (FINE && !REDUCED) {
  const cursor = document.getElementById('cursor');
  const x = gsap.quickTo(cursor, 'x', { duration: 0.22, ease: 'power3' });
  const y = gsap.quickTo(cursor, 'y', { duration: 0.22, ease: 'power3' });

  window.addEventListener('pointermove', (e) => {
    if (!cursor.classList.contains('is-awake')) {
      gsap.set(cursor, { x: e.clientX, y: e.clientY });
      cursor.classList.add('is-awake');
    }
    x(e.clientX); y(e.clientY);
  }, { passive: true });

  document.querySelectorAll('a, button, .panel__card').forEach((el) => {
    el.addEventListener('pointerenter', () => gsap.to(cursor, { scale: 1.9, duration: 0.24, ease: 'power3.out' }));
    el.addEventListener('pointerleave', () => gsap.to(cursor, { scale: 1, duration: 0.24, ease: 'power3.out' }));
  });
}

/* ---------------------------------------------------------
   Nav hairline
   --------------------------------------------------------- */
ScrollTrigger.create({
  start: 'top -60',
  onUpdate: (self) => document.getElementById('nav').classList.toggle('is-stuck', self.scroll() > 60)
});

/* ---------------------------------------------------------
   Ticker
   --------------------------------------------------------- */
(function ticker() {
  const track = document.getElementById('tickerTrack');
  if (!track || REDUCED) return;
  track.innerHTML += track.innerHTML;
  const half = track.scrollWidth / 2;
  gsap.to(track, {
    x: -half,
    duration: 30,
    ease: 'none',
    repeat: -1,
    modifiers: { x: (v) => `${parseFloat(v) % half}px` }
  });
})();

/* ---------------------------------------------------------
   Manifesto
   --------------------------------------------------------- */
(function manifesto() {
  const el = document.getElementById('scrubText');
  if (!el) return;

  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  el.setAttribute('aria-label', words.join(' '));

  const spans = words.map((w, i) => {
    const s = document.createElement('span');
    s.className = 'w';
    s.textContent = w;
    s.setAttribute('aria-hidden', 'true');
    el.appendChild(s);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    return s;
  });

  if (REDUCED) { gsap.set(spans, { opacity: 1 }); return; }

  gsap.to(spans, {
    opacity: 1,
    ease: 'none',
    stagger: 0.5,
    scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 62%', scrub: 0.4 }
  });
})();

/* ---------------------------------------------------------
   Main stage: pinned, everything scrubbed off one timeline
   --------------------------------------------------------- */
if (!REDUCED) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#skribbl',
      start: 'top top',
      end: '+=110%',
      // Pin the inner wrapper, not the section. A pinned element keeps the
      // width it was measured at, so pinning the section itself lets a stale
      // measurement push the page wider than the viewport.
      pin: '#stagePin',
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  // fromTo throughout, never from: this timeline is scrubbed and refreshed on
  // resize, and a `from` tween re-records whatever the element happens to be
  // showing at refresh time, which leaves everything stuck at opacity 0.
  tl.fromTo('#stageBgWord', { xPercent: 2 }, { xPercent: -34, ease: 'none' }, 0)
    .fromTo('#stageShot',
      { clipPath: 'inset(0 0 100% 0)' },
      { clipPath: 'inset(0 0 0% 0)', ease: 'power2.out', duration: 0.55 }, 0)
    .fromTo('#stageShot img', { scale: 1.1 }, { scale: 1, ease: 'none', duration: 0.55 }, 0)
    .fromTo('.stage__head > *',
      { yPercent: 60, opacity: 0 },
      { yPercent: 0, opacity: 1, stagger: 0.08, duration: 0.35 }, 0.05)
    .fromTo('.stage__body',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3 }, 0.35)
    .fromTo('.stage__facts li',
      { x: -24, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.12, duration: 0.3 }, 0.45);
}

/* ---------------------------------------------------------
   Battles: sticky stack, each card shrinks under the next
   --------------------------------------------------------- */
if (!REDUCED) {
  const panels = gsap.utils.toArray('.panel');
  panels.forEach((panel, i) => {
    if (i === panels.length - 1) return;
    gsap.to(panel.querySelector('.panel__card'), {
      scale: 0.93,
      opacity: 0.4,
      ease: 'none',
      scrollTrigger: { trigger: panels[i + 1], start: 'top bottom', end: 'top top', scrub: true }
    });
  });

  gsap.from('.panel__card', {
    y: 40,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.05,
    scrollTrigger: { trigger: '#stackList', start: 'top 85%', once: true }
  });
}

/* ---------------------------------------------------------
   Prizes: parallax on the photograph, podium rows on scrub
   --------------------------------------------------------- */
if (!REDUCED) {
  const img = document.querySelector('.prizes__img img');
  if (img) {
    gsap.fromTo(img, { yPercent: -8 }, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: '.prizes__img', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  gsap.utils.toArray('.podium__row').forEach((row) => {
    gsap.fromTo(row,
      { x: -28, opacity: 0 },
      {
        x: 0, opacity: 1, ease: 'power2.out',
        scrollTrigger: { trigger: row, start: 'top 92%', end: 'top 62%', scrub: 0.6 }
      });
  });

  gsap.utils.toArray('.trade__list li').forEach((li) => {
    gsap.fromTo(li,
      { x: 24, opacity: 0 },
      {
        x: 0, opacity: 1, ease: 'power2.out',
        scrollTrigger: { trigger: li, start: 'top 94%', end: 'top 70%', scrub: 0.6 }
      });
  });
}

/* ---------------------------------------------------------
   Section reveal for the remaining blocks
   --------------------------------------------------------- */
if (!REDUCED) {
  ['.battles__head', '.prizes > .kicker', '.prizes__title', '.prizes__lede',
   '.trade__title', '.trade__body', '.play__title', '.play__board']
    .forEach((selector) => {
      gsap.utils.toArray(selector).forEach((el) => {
        gsap.from(el, {
          y: 18,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        });
      });
    });

  // Footer wordmark straightens as it arrives.
  gsap.fromTo('.foot__title',
    { skewX: -18, yPercent: 18, opacity: 0 },
    {
      skewX: -9, yPercent: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.foot__title', start: 'top 95%', end: 'top 55%', scrub: 0.6 }
    });
}

/* ---------------------------------------------------------
   Counters
   --------------------------------------------------------- */
document.querySelectorAll('[data-count]').forEach((el) => {
  const end = parseFloat(el.dataset.count);
  if (REDUCED) { el.textContent = end; return; }
  const obj = { v: 0 };
  gsap.to(obj, {
    v: end,
    duration: 1.1,
    ease: 'power2.out',
    onUpdate: () => { el.textContent = Math.round(obj.v); },
    scrollTrigger: { trigger: el, start: 'top 90%', once: true }
  });
});

/* ---------------------------------------------------------
   Playground: drag D E C O R E into the slots
   --------------------------------------------------------- */
(function playground() {
  const board = document.getElementById('playBoard');
  const win = document.getElementById('playWin');
  const reset = document.getElementById('playReset');
  if (!board) return;

  const tiles = [...board.querySelectorAll('.tile')];
  const slots = [...board.querySelectorAll('.slot')];
  let draggables = [];

  const rect = (el) => el.getBoundingClientRect();
  const centre = (el) => {
    const r = rect(el);
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  /** Nearest free slot that wants this tile's letter, if it is close enough. */
  function targetSlot(tile) {
    const c = centre(tile);
    const reach = rect(tile).width * 0.9;
    let best = null;
    let bestDistance = Infinity;

    slots.forEach((slot) => {
      if (slot.classList.contains('is-filled')) return;
      if (slot.dataset.letter !== tile.dataset.letter) return;
      const sc = centre(slot);
      const d = Math.hypot(sc.x - c.x, sc.y - c.y);
      if (d < bestDistance) { bestDistance = d; best = slot; }
    });

    return bestDistance <= reach ? best : null;
  }

  function scatter() {
    const bw = board.clientWidth;
    const bh = board.clientHeight;
    const size = rect(tiles[0]).width || 60;
    const top = (slots[0] ? rect(slots[0]).height : size) + 40;
    const laneW = Math.max(bw - size, 1);
    const laneH = Math.max(bh - top - size, 1);
    const clamp = (v, max) => Math.max(0, Math.min(v, max));

    tiles.forEach((tile, i) => {
      tile.classList.remove('is-locked', 'is-dragging');
      delete tile.dataset.placed;
      const lane = tiles.length > 1 ? i / (tiles.length - 1) : 0;
      gsap.set(tile, {
        x: 0,
        y: 0,
        rotation: gsap.utils.random(-14, 14),
        left: Math.round(clamp(lane * laneW * 0.96, laneW)),
        top: Math.round(top + clamp(Math.random() * laneH * 0.72, laneH))
      });
    });

    slots.forEach((s) => s.classList.remove('is-filled', 'is-near'));
    win.classList.remove('is-on');
    // Draggable caches each element's offset when created, so anything that
    // moves a tile afterwards has to tell it to re-measure.
    draggables.forEach((d) => { d.enable(); d.update(true); });
  }

  function checkWin() {
    if (slots.every((s) => s.classList.contains('is-filled'))) win.classList.add('is-on');
  }

  function place(tile, slot) {
    const t = rect(tile);
    const s = rect(slot);
    gsap.to(tile, {
      x: `+=${s.left - t.left}`,
      y: `+=${s.top - t.top}`,
      rotation: 0,
      duration: 0.4,
      ease: 'power4.out',
      onComplete: checkWin
    });
    slot.classList.add('is-filled');
    tile.classList.add('is-locked');
    tile.dataset.placed = slot.dataset.letter;
  }

  function build() {
    draggables.forEach((d) => d.kill());
    draggables = Draggable.create(tiles, {
      type: 'x,y',
      bounds: board,
      allowContextMenu: true,
      onPress() {
        this.target.classList.add('is-dragging');
        this.target.style.zIndex = 10;
        // Set, never tween: a concurrent transform tween fights Draggable for
        // the element's matrix and the drag ends up going nowhere.
        gsap.set(this.target, { rotation: 0 });
        this.update(true);
      },
      onDrag() {
        const hit = targetSlot(this.target);
        slots.forEach((s) => s.classList.toggle('is-near', s === hit));
      },
      onRelease() {
        this.target.classList.remove('is-dragging');
        slots.forEach((s) => s.classList.remove('is-near'));
        const slot = targetSlot(this.target);
        if (!slot) return;
        place(this.target, slot);
        this.disable();
      }
    });
  }

  // Tap and keyboard path, so the puzzle is not drag-only on touch.
  tiles.forEach((tile) => {
    tile.addEventListener('click', () => {
      if (tile.dataset.placed) return;
      const slot = slots.find((s) => !s.classList.contains('is-filled') && s.dataset.letter === tile.dataset.letter);
      if (!slot) return;
      place(tile, slot);
      const d = Draggable.get(tile);
      if (d) d.disable();
    });
  });

  // Position first, then create the Draggables against the settled layout.
  function init() { scatter(); build(); }

  reset.addEventListener('click', init);

  init();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
  window.addEventListener('load', init);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (tiles.every((t) => !t.dataset.placed)) init();
    }, 200);
  });
})();

window.addEventListener('load', () => ScrollTrigger.refresh());
