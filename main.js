/* =========================================================
   Compositions: Design Battles - motion layer

   Each animation has one job:
     hero layers      -> the type reads as one moving surface, not 3 headings
     hero parallax    -> depth between the layers and the mark
     ticker           -> content, the six event names
     manifesto scrub  -> sets reading pace on the one statement
     stage image      -> slow push, keeps the main stage from sitting dead
     sticky stack     -> each event holds the viewport on its own turn
     counters         -> emphasis on the three numbers that matter
     drag puzzle      -> the payoff interaction
   ========================================================= */

gsap.registerPlugin(ScrollTrigger, Draggable);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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
    if (lenis) lenis.scrollTo(target, { offset: -60 });
    else target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
  });
});

/* ---------------------------------------------------------
   Skew lives in GSAP, not just CSS, so entry and parallax
   tweens compose with it instead of wiping it off.
   --------------------------------------------------------- */
gsap.set('.hero__stack .line, .foot__title', { skewX: -9 });
gsap.set('.mark', { yPercent: -50 });

if (FINE && !REDUCED) document.body.classList.add('has-cursor');

/* ---------------------------------------------------------
   Hero entry
   --------------------------------------------------------- */
if (!REDUCED) {
  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .from('.hero__meta span', { y: -12, opacity: 0, duration: 0.6, stagger: 0.06 })
    .from('.hero__stack .line', { yPercent: 60, opacity: 0, duration: 1, stagger: 0.09 }, 0.1)
    .from('.mark', { scale: 0.82, opacity: 0, duration: 1.1, ease: 'power3.out' }, 0.35)
    .from('.hero__foot > *', { y: 14, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.55);

  // The layers drift apart as the hero leaves. Depth per layer, set in markup.
  gsap.utils.toArray('.hero [data-depth]').forEach((el) => {
    gsap.to(el, {
      y: () => parseFloat(el.dataset.depth) * 2.4,
      ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.7 }
    });
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
   Nav flips from the dark hero to the page palette
   --------------------------------------------------------- */
(function nav() {
  const el = document.getElementById('nav');
  const hero = document.getElementById('hero');
  ScrollTrigger.create({
    trigger: hero,
    start: 'bottom 68px',
    onEnter: () => el.classList.add('is-stuck'),
    onLeaveBack: () => el.classList.remove('is-stuck')
  });
})();

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
    scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 60%', scrub: 0.4 }
  });
})();

/* ---------------------------------------------------------
   Main stage image: slow push while it crosses the viewport
   --------------------------------------------------------- */
if (!REDUCED) {
  // Drift, not zoom: the image is contained, so scaling it would reveal the box.
  const img = document.querySelector('#stageImg img');
  if (img) {
    gsap.fromTo(img, { yPercent: -4 }, {
      yPercent: 4,
      ease: 'none',
      scrollTrigger: { trigger: '#stageImg', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }
}

/* ---------------------------------------------------------
   Sticky stack: the card under the incoming one shrinks back
   --------------------------------------------------------- */
if (!REDUCED) {
  const panels = gsap.utils.toArray('.panel');
  panels.forEach((panel, i) => {
    if (i === panels.length - 1) return;
    gsap.to(panel.querySelector('.panel__card'), {
      scale: 0.93,
      opacity: 0.45,
      ease: 'none',
      scrollTrigger: {
        trigger: panels[i + 1],
        start: 'top bottom',
        end: 'top top',
        scrub: true
      }
    });
  });

  gsap.from('.panel', {
    y: 40,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.05,
    scrollTrigger: { trigger: '#stackList', start: 'top 85%', once: true }
  });
}

/* ---------------------------------------------------------
   Section reveal: one move, once
   --------------------------------------------------------- */
if (!REDUCED) {
  const targets = [
    '.stage__head', '.stage__img', '.stage__grid',
    '.stack__head',
    '.prizes__top > div', '.prizes__img', '.podium', '.scores',
    '.play__title', '.play__board',
    '.foot__title', '.foot__row'
  ];

  targets.forEach((selector) => {
    gsap.utils.toArray(selector).forEach((el) => {
      gsap.from(el, {
        y: 18,
        opacity: 0,
        duration: 0.65,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
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
    scrollTrigger: { trigger: el, start: 'top 88%', once: true }
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
    const reach = rect(tile).width * 0.85;
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
    const size = rect(tiles[0]).width || 80;
    const top = (slots[0] ? rect(slots[0]).height : size) + 48;
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

  // Keyboard and tap path, so the puzzle is not drag-only.
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
