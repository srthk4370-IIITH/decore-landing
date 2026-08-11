/* =========================================================
   Compositions: Design Battles - motion layer
   GSAP + ScrollTrigger + Draggable + Lenis
   ========================================================= */

gsap.registerPlugin(ScrollTrigger, Draggable);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

/* ---------------------------------------------------------
   1. Setup & Helpers
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

function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  el.setAttribute('aria-label', text);
  return [...text].map((c) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.textContent = c === ' ' ? '\u00A0' : c;
    s.setAttribute('aria-hidden', 'true');
    el.appendChild(s);
    return s;
  });
}

function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  el.setAttribute('aria-label', words.join(' '));
  return words.map((w, i) => {
    const s = document.createElement('span');
    s.className = 'w';
    s.textContent = w;
    s.setAttribute('aria-hidden', 'true');
    el.appendChild(s);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    return s;
  });
}

/* ---------------------------------------------------------
   2. Hero arc word: build letters, apply the curve
   --------------------------------------------------------- */
const arcEl = document.getElementById('arcWord');
const ARC_WORD = 'COMPOSITIONS';
const arcLetters = [];
const arcInner = [];
if (arcEl) {
  [...ARC_WORD].forEach((c) => {
    const outer = document.createElement('span');
    const inner = document.createElement('span');
    inner.className = 'arc__i';
    inner.textContent = c;
    outer.setAttribute('aria-hidden', 'true');
    outer.appendChild(inner);
    arcEl.appendChild(outer);
    arcLetters.push(outer);
    arcInner.push(inner);
  });
}

function applyArc(k) {
  const c = (arcInner.length - 1) / 2;
  arcInner.forEach((el, i) => {
    const t = (i - c) / c;
    el.style.transform =
      `translateY(${t * t * 9 * k}%) rotate(${t * 7 * k}deg) scaleY(${1 + Math.abs(t) * 0.06 * k})`;
  });
}
if (arcEl) applyArc(1);

/* ---------------------------------------------------------
   3. Preloader
   --------------------------------------------------------- */
const preloader = document.getElementById('preloader');
const preCount = document.getElementById('preCount');
const preWordSpans = document.querySelectorAll('#preWord span');

function startPage() {
  document.body.classList.add('is-loaded');
  if (FINE && !REDUCED) document.body.classList.add('has-cursor');

  const tl = gsap.timeline();
  tl.to('#nav', { y: 0, duration: 0.6, ease: 'power3.out' }, 0.05)
    .from(arcLetters, {
      yPercent: 108,
      duration: 1,
      ease: 'power4.out',
      stagger: { each: 0.035, from: 'center' }
    }, 0)
    .from('.hero__brand, .hero__sub-line, .hero__lede, .hero__actions', {
      y: 18, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06
    }, 0.25)
    .from('.hero__float', {
      y: 50, opacity: 0, scale: 0.9, duration: 1, ease: 'power3.out',
      stagger: { each: 0.12, from: 'random' }
    }, 0.35)
    .from('#heroBadge', { scale: 0, opacity: 0, rotation: -90, duration: 0.8, ease: 'back.out(1.7)' }, 0.5)
    .from('#heroScroll', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, 0.7);

  ScrollTrigger.refresh();
}

if (preloader) {
  if (REDUCED) {
    gsap.set(preloader, { display: 'none' });
    gsap.set('#nav', { y: 0 });
    gsap.set('.hero__float', { opacity: 1 });
    document.body.classList.add('is-loaded');
  } else {
    const counter = { v: 0 };
    const pre = gsap.timeline();
    if (preWordSpans.length) {
      pre.from(preWordSpans, { yPercent: 110, duration: 0.7, ease: 'power4.out', stagger: 0.026 }, 0);
    }
    pre.from('.preloader__mark', { scale: 0.9, opacity: 0, rotate: -40, duration: 0.7, ease: 'power3.out' }, 0.05)
       .to(counter, {
         v: 100, duration: 1.5, ease: 'power2.inOut',
         onUpdate: () => { if (preCount) preCount.textContent = String(Math.round(counter.v)).padStart(2, '0'); }
       }, 0)
       .to('.preloader__inner, .preloader__count', { opacity: 0, duration: 0.3, ease: 'power2.in' }, '+=0.1')
       .to(preloader, {
         clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'power4.inOut',
         onStart: startPage,
         onComplete: () => gsap.set(preloader, { display: 'none' })
       }, '-=0.1');
  }
}

/* ---------------------------------------------------------
   4. Cursor: lerped follower, label swap, magnetic, section invert
   --------------------------------------------------------- */
if (FINE && !REDUCED) {
  const cursor = document.getElementById('cursor');
  if (cursor) {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    const label = document.getElementById('cursorLabel');

    const LABELS = { go: 'Go', peek: 'View', drag: 'Drag', home: 'Top' };

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    
    const darkSections = document.querySelectorAll('.stage, .play');

    window.addEventListener('pointermove', (e) => {
      if (!cursor.classList.contains('is-awake')) {
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
        cursor.classList.add('is-awake');
      }
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);

      let isOverDark = false;
      darkSections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          isOverDark = true;
        }
      });
      if (isOverDark) {
        cursor.classList.add('is-inv');
      } else {
        cursor.classList.remove('is-inv');
      }
    }, { passive: true });

    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('pointerenter', () => {
        if(label) label.textContent = LABELS[el.dataset.cursor] || '';
        cursor.classList.add('is-active');
      });
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
    });

    document.querySelectorAll('[data-magnet]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }
}

/* ---------------------------------------------------------
   5. Hero mouse-tracked parallax (NEW)
   --------------------------------------------------------- */
if (FINE && !REDUCED) {
  const hero = document.getElementById('hero');
  const gallery = document.getElementById('heroGallery');
  const floats = document.querySelectorAll('.hero__float');
  
  if (hero && gallery && floats.length) {
    const floatMovers = Array.from(floats).map(el => ({
      x: gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' }),
      y: gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' }),
      speed: parseFloat(el.dataset.speed || 1)
    }));
    
    const rotXTo = gsap.quickTo(gallery, 'rotationX', { duration: 0.8, ease: 'power3' });
    const rotYTo = gsap.quickTo(gallery, 'rotationY', { duration: 0.8, ease: 'power3' });
    
    gsap.set(gallery, { transformPerspective: 1000 });
    
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      
      floatMovers.forEach(m => {
        m.x(nx * 100 * m.speed);
        m.y(ny * 100 * m.speed);
      });
      
      rotYTo(nx * 10);
      rotXTo(-ny * 10);
    });
    
    hero.addEventListener('mouseleave', () => {
      floatMovers.forEach(m => { m.x(0); m.y(0); });
      rotXTo(0);
      rotYTo(0);
    });
  }
}

/* ---------------------------------------------------------
   6. Scroll indicator (NEW)
   --------------------------------------------------------- */
const scrollInd = document.getElementById('heroScroll');
if (scrollInd && !REDUCED) {
  gsap.to(scrollInd, {
    y: 20,
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '+=100',
      scrub: true
    }
  });
}

/* ---------------------------------------------------------
   7. Hero badge scroll interaction (NEW)
   --------------------------------------------------------- */
const heroBadge = document.getElementById('heroBadge');
if (heroBadge && !REDUCED) {
  gsap.to(heroBadge, {
    rotation: 360,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
}

/* ---------------------------------------------------------
   8. Nav stuck state
   --------------------------------------------------------- */
const navEl = document.getElementById('nav');
if (navEl) {
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => navEl.classList.toggle('is-stuck', self.scroll() > 80)
  });
}

/* ---------------------------------------------------------
   9. Hero parallax (updated)
   --------------------------------------------------------- */
if (!REDUCED) {
  const arcState = { k: 1 };
  const hTrigger = document.getElementById('hero');
  if (hTrigger) {
    ScrollTrigger.create({
      trigger: hTrigger,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.6,
      onUpdate: (self) => {
        arcState.k = 1 + self.progress * 2.4;
        applyArc(arcState.k);
      }
    });
  }

  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    gsap.to(el, {
      yPercent: parseFloat(el.dataset.parallax || 0),
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
  
  gsap.utils.toArray('.hero__float').forEach((el) => {
    if (el.dataset.speed) {
      gsap.to(el, {
        yPercent: parseFloat(el.dataset.speed) * 30, // Parallax intensity
        ease: 'none',
        scrollTrigger: { trigger: hTrigger, start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  });
}

/* ---------------------------------------------------------
   10. Ticker: velocity response (NEW)
   --------------------------------------------------------- */
(function ticker() {
  const track = document.getElementById('tickerTrack');
  if (!track || REDUCED) return;
  track.innerHTML += track.innerHTML;
  const half = track.scrollWidth / 2;

  const loop = gsap.to(track, {
    x: -half, duration: 22, ease: 'none', repeat: -1,
    modifiers: { x: (x) => `${parseFloat(x) % half}px` }
  });

  ScrollTrigger.create({
    onUpdate: (self) => {
      const dir = self.direction;
      const vel = Math.abs(self.getVelocity() || 0);
      let speed = 1 + vel / 1000;
      gsap.to(loop, { timeScale: (dir === 1 ? speed : -speed), duration: 0.4, overwrite: true });
    }
  });
})();

/* ---------------------------------------------------------
   11. Manifesto: word scrub
   --------------------------------------------------------- */
(function manifesto() {
  const el = document.getElementById('scrubText');
  if (!el) return;
  const words = splitWords(el);
  if (REDUCED) { gsap.set(words, { opacity: 1 }); return; }
  gsap.to(words, {
    opacity: 1,
    ease: 'none',
    stagger: 0.5,
    scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 55%', scrub: 0.4 }
  });
})();

/* ---------------------------------------------------------
   12 & 13. Split text reveals & Clip reveals
   --------------------------------------------------------- */
document.querySelectorAll('[data-split]').forEach((el) => {
  const chars = splitChars(el);
  if (REDUCED) return;
  gsap.from(chars, {
    yPercent: 110,
    duration: 0.9,
    ease: 'power4.out',
    stagger: 0.03,
    scrollTrigger: { trigger: el, start: 'top 85%', once: true }
  });
});

document.querySelectorAll('[data-clip]').forEach((el) => {
  if (REDUCED) return;
  gsap.to(el, {
    clipPath: 'inset(0 0 0% 0)',
    duration: 1.1,
    ease: 'power3.inOut',
    scrollTrigger: { trigger: el, start: 'top 82%', once: true }
  });
  const img = el.querySelector('img');
  if (img) {
    gsap.from(img, {
      scale: 1.18,
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true }
    });
  }
});

/* ---------------------------------------------------------
   14. DNA section animations (NEW)
   --------------------------------------------------------- */
if (!REDUCED) {
  const dnaItems = document.querySelectorAll('.dna__item');
  if (dnaItems.length) {
    gsap.from(dnaItems, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: '#dnaGrid', start: 'top 85%', once: true }
    });
    
    if (FINE) {
      dnaItems.forEach((el) => {
        const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
        const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
        gsap.set(el, { transformPerspective: 900, transformOrigin: 'center' });
        el.addEventListener('pointermove', (e) => {
          const r = el.getBoundingClientRect();
          ry(((e.clientX - (r.left + r.width / 2)) / r.width) * 12);
          rx(((e.clientY - (r.top + r.height / 2)) / r.height) * -12);
        });
        el.addEventListener('pointerleave', () => { rx(0); ry(0); });
      });
    }
  }
}

/* ---------------------------------------------------------
   15. Horizontal pan
   --------------------------------------------------------- */
(function pan() {
  const wrap = document.getElementById('battles');
  const track = document.getElementById('panTrack');
  if (!wrap || !track || REDUCED) return;

  const getDistance = () => track.scrollWidth - window.innerWidth + 32;

  gsap.to(track, {
    x: () => -getDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: wrap,
      start: 'top top',
      end: () => `+=${getDistance()}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1
    }
  });

  gsap.from(track.querySelectorAll('.card'), {
    y: 40, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08,
    scrollTrigger: { trigger: wrap, start: 'top 70%', once: true }
  });
})();

/* ---------------------------------------------------------
   16. Points counters (ENHANCE spring bounce)
   --------------------------------------------------------- */
document.querySelectorAll('[data-count]').forEach((el) => {
  const end = parseFloat(el.dataset.count);
  if (REDUCED) { el.textContent = end; return; }
  const obj = { v: 0 };
  
  gsap.timeline({
    scrollTrigger: { trigger: el, start: 'top 85%', once: true }
  })
  .to(obj, {
    v: end * 1.15,
    duration: 1.0,
    ease: 'power2.out',
    onUpdate: () => { el.textContent = Math.round(obj.v); }
  })
  .to(obj, {
    v: end,
    duration: 0.6,
    ease: 'power2.out',
    onUpdate: () => { el.textContent = Math.round(obj.v); }
  });
});

/* ---------------------------------------------------------
   17. Prizes tilt (ADD staggered reveal)
   --------------------------------------------------------- */
if (!REDUCED) {
  const bentoTiles = document.querySelectorAll('.bento__tile');
  if (bentoTiles.length) {
    gsap.from(bentoTiles, {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.prizes__bento',
        start: 'top 85%',
        once: true
      }
    });
  }
}

if (FINE && !REDUCED) {
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
    gsap.set(el, { transformPerspective: 900, transformOrigin: 'center' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      ry(((e.clientX - (r.left + r.width / 2)) / r.width) * 12);
      rx(((e.clientY - (r.top + r.height / 2)) / r.height) * -12);
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}

/* ---------------------------------------------------------
   19. Intersection Observer fade-up (NEW)
   --------------------------------------------------------- */
(function fadeUpObserver() {
  if (REDUCED) return;
  const elements = document.querySelectorAll('.dna__head, .points__title, .prizes__head, .play__title');
  if (!elements.length) return;
  
  elements.forEach(el => el.classList.add('fade-up'));
  
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  elements.forEach(el => observer.observe(el));
})();

/* ---------------------------------------------------------
   18. Playground: drag D E C O R E + floating + confetti
   --------------------------------------------------------- */
(function playground() {
  const board = document.getElementById('playBoard');
  const letters = document.getElementById('playLetters');
  if (!board || !letters) return;

  const tiles = [...letters.querySelectorAll('.tile')];
  const slots = [...document.querySelectorAll('#playSlots .slot')];
  const win = document.getElementById('playWin');
  const reset = document.getElementById('playReset');
  
  const floatTweens = new Map();

  function scatter() {
    const b = board.getBoundingClientRect();
    const t = tiles[0].getBoundingClientRect();
    const topOffset = slots[0].getBoundingClientRect().height + 48;
    const zone = { w: Math.max(b.width - t.width, 10), h: Math.max(b.height - topOffset - t.height, 10) };

    tiles.forEach((tile, i) => {
      tile.classList.remove('is-locked');
      tile.dataset.placed = '';
      const col = i / (tiles.length - 1);
      gsap.set(tile, {
        x: 0, y: 0,
        left: Math.min(zone.w, col * zone.w * 0.92 + (Math.random() * 0.06 * zone.w)),
        top: topOffset + Math.random() * zone.h,
        rotation: gsap.utils.random(-16, 16)
      });
      
      if (floatTweens.has(tile)) {
        floatTweens.get(tile).kill();
      }
      if (!REDUCED) {
        const tween = gsap.to(tile, {
          y: '+=random(-8, 8)',
          rotation: 'random(-3, 3)',
          duration: 'random(2.5, 4)',
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: Math.random()
        });
        floatTweens.set(tile, tween);
      }
    });
    slots.forEach((s) => s.classList.remove('is-filled', 'is-near'));
    if(win) win.classList.remove('is-on');
  }

  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function getHitSlot(d) {
    const c = centerOf(d.target);
    let best = null, bestD = Infinity;
    slots.forEach((s) => {
      if (s.classList.contains('is-filled')) return;
      if (s.dataset.letter !== d.target.dataset.letter) return;
      const sc = centerOf(s);
      const dist = Math.hypot(sc.x - c.x, sc.y - c.y);
      if (dist < bestD) { bestD = dist; best = s; }
    });
    return bestD < 140 ? best : null;
  }

  function createConfetti() {
    if (REDUCED) return;
    const bRect = board.getBoundingClientRect();
    const centerX = bRect.width / 2;
    const centerY = bRect.height / 2;
    const colors = ['#FF0000', '#FFD700', '#00C853', '#2979FF', '#FF6D00'];
    
    for (let i = 0; i < 50; i++) {
      const p = document.createElement('div');
      p.className = 'confetti';
      p.style.position = 'absolute';
      p.style.left = centerX + 'px';
      p.style.top = centerY + 'px';
      p.style.width = '8px';
      p.style.height = '16px';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.zIndex = 100;
      board.appendChild(p);
      
      gsap.to(p, {
        x: gsap.utils.random(-300, 300),
        y: gsap.utils.random(-300, 300),
        rotation: gsap.utils.random(0, 360),
        scale: gsap.utils.random(0.5, 1.5),
        opacity: 0,
        duration: gsap.utils.random(1, 2.5),
        ease: 'power3.out',
        onComplete: () => p.remove()
      });
    }
  }

  function checkWin() {
    if (slots.every((s) => s.classList.contains('is-filled'))) {
      if(win) win.classList.add('is-on');
      createConfetti();
      if (!REDUCED) {
        gsap.fromTo(slots,
          { scale: 1 },
          { scale: 1.06, duration: 0.22, ease: 'power2.out', stagger: 0.04, yoyo: true, repeat: 1 });
      }
    }
  }

  Draggable.create(tiles, {
    type: 'x,y',
    bounds: board,
    inertia: false,
    onPress() {
      if (floatTweens.has(this.target)) {
        floatTweens.get(this.target).kill();
      }
      gsap.to(this.target, { rotation: 0, scale: 1.04, duration: 0.2, ease: 'power3.out' });
      this.target.classList.add('is-dragging');
      this.target.style.zIndex = 10;
    },
    onDrag() {
      const hit = getHitSlot(this);
      slots.forEach((s) => s.classList.toggle('is-near', s === hit));
    },
    onRelease() {
      this.target.classList.remove('is-dragging');
      gsap.to(this.target, { scale: 1, duration: 0.2, ease: 'power3.out' });
      const slot = getHitSlot(this);
      slots.forEach((s) => s.classList.remove('is-near'));
      
      if (!slot) {
        if (!REDUCED) {
          const tween = gsap.to(this.target, {
            y: '+=random(-8, 8)',
            rotation: 'random(-3, 3)',
            duration: 'random(2.5, 4)',
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
          });
          floatTweens.set(this.target, tween);
        }
        return;
      }

      const tile = this.target;
      
      // Instantly append and lock it perfectly into the slot
      slot.appendChild(tile);
      gsap.set(tile, { clearProps: "all" });
      gsap.set(tile, { x: 0, y: 0, left: 0, top: 0, width: '100%', height: '100%' });
      
      slot.classList.add('is-filled');
      tile.classList.add('is-locked');
      tile.dataset.placed = slot.dataset.letter;
      this.disable();
      
      checkWin();
    }
  });

  const init = () => {
    tiles.forEach((t) => { 
      letters.appendChild(t);
      gsap.set(t, { clearProps: "all" });
      const d = Draggable.get(t); 
      if (d) d.enable(); 
    });
    scatter();
  };

  if(reset) reset.addEventListener('click', init);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
  else window.addEventListener('load', init);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (tiles.every((t) => !t.dataset.placed)) init();
    }, 180);
  });
})();

/* ---------------------------------------------------------
   21. Final refresh
   --------------------------------------------------------- */
window.addEventListener('load', () => ScrollTrigger.refresh());
