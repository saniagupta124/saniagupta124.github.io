/* =====================================================
   projects.js — uniform domino layout
   Per-card transformPerspective keeps all cards the same
   apparent size and the same visual angle regardless of
   x position. All z = 0 so there is no size falloff.
   On hover: card rotates in place (x never changes).
   Neighbour groups shift as a unit, preserving overlap.
   ===================================================== */

const RESTING_ANGLE   = 52;   /* steep enough to look clearly angled */
const RESTING_SPACING = 158;  /* px between card centres */
const SPREAD          = 140;  /* px each side shifts as a group on hover */

const RESTING = [
  { rotateY: RESTING_ANGLE, x: -RESTING_SPACING * 2, z: 0, scale: 1 },
  { rotateY: RESTING_ANGLE, x: -RESTING_SPACING,      z: 0, scale: 1 },
  { rotateY: RESTING_ANGLE, x: 0,                      z: 0, scale: 1 },
  { rotateY: RESTING_ANGLE, x:  RESTING_SPACING,       z: 0, scale: 1 },
  { rotateY: RESTING_ANGLE, x:  RESTING_SPACING * 2,  z: 0, scale: 1 },
];

/* Hovered card rotates to face viewer, stays at its resting x so
   the cursor is never displaced.  Each side shifts as a unit.     */
function getHoverPos(diff, r) {
  if (diff === 0) return { rotateY: 0, x: r.x, z: 0, scale: 1.05 };
  const sign = diff < 0 ? -1 : 1;
  return { rotateY: RESTING_ANGLE, x: r.x + sign * SPREAD, z: 0, scale: r.scale };
}

function restoreAll(cards) {
  cards.forEach((card, i) => {
    const r = RESTING[i];
    gsap.to(card, { rotateY: r.rotateY, x: r.x, z: r.z, scale: r.scale,
                     duration: 0.9, ease: 'expo.out', overwrite: 'auto' });
    card.style.boxShadow = '';
    card.style.zIndex = String(i + 1);
  });
}

function applyFanLayout(cards) {
  cards.forEach((card, i) => {
    const r = RESTING[i];
    card.style.zIndex = String(i + 1);
    gsap.set(card, {
      transformPerspective: 5000, /* large = near-parallel top/bottom edges */
      rotateY:  r.rotateY,
      x:        r.x,
      z:        r.z,
      scale:    r.scale,
      xPercent: -50,
      yPercent: -50,
      /* % of the 115vh sticky box — nudged below the 56% (≈64vh) spot the
         fan originally occupied, per taste. */
      top:      '58.5%',
      left:     '50%',
    });
  });
}

export function initProjects() {
  const stage = document.querySelector('.cards-stage');
  const cards = Array.from(document.querySelectorAll('.project-card'));
  if (!stage || !cards.length || typeof gsap === 'undefined') return;

  applyFanLayout(cards);

  let hoverTimer = null;
  let leaveTimer = null;
  let mode = 'cards'; /* 'cards' = fan/hover animation, 'gallery' = static grid, CSS-only hover */

  cards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => {
      if (mode === 'gallery') return;
      clearTimeout(leaveTimer);
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        cards.forEach((c, j) => {
          const pos = getHoverPos(j - i, RESTING[j]);
          gsap.to(c, { rotateY: pos.rotateY, x: pos.x, z: pos.z, scale: pos.scale,
                        duration: 0.9, ease: 'expo.out', overwrite: 'auto' });
          c.style.boxShadow = j === i
            ? '0 24px 48px rgba(26,72,163,0.22)'
            : '0 6px 16px rgba(26,72,163,0.05)';
          c.style.zIndex = j === i ? '10' : String(j + 1);
        });
      }, 200);
    });

    card.addEventListener('mouseleave', e => {
      if (mode === 'gallery') return;
      const to = e.relatedTarget;
      if (!cards.some(c => c === to || c.contains(to))) {
        clearTimeout(hoverTimer);
        leaveTimer = setTimeout(() => restoreAll(cards), 160);
      }
    });
  });

  stage.addEventListener('mouseleave', () => {
    if (mode === 'gallery') return;
    clearTimeout(hoverTimer);
    clearTimeout(leaveTimer);
    restoreAll(cards);
  });

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const href = card.dataset.href;
      if (!href) return;
      gsap.to(document.body, { opacity: 0, duration: 0.35, ease: 'power2.in',
        onComplete: () => { window.location.href = href; } });
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });

  /* ── Cards / Gallery view toggle ──
     Both modes render inside the same fixed 100vh sticky box — only the
     .cards-stage / .project-card layout swaps, so toggling never touches
     #hero's height or scroll position. */
  const toggleBtns = Array.from(document.querySelectorAll('.view-toggle-btn'));
  if (!toggleBtns.length) return;

  function setMode(next) {
    if (next === mode) return;
    clearTimeout(hoverTimer);
    clearTimeout(leaveTimer);
    mode = next;

    stage.classList.toggle('mode-gallery', mode === 'gallery');

    if (mode === 'gallery') {
      cards.forEach(c => {
        gsap.killTweensOf(c);
        gsap.set(c, { clearProps: 'all' });
        c.style.boxShadow = '';
        c.style.zIndex = '';
      });
    } else {
      applyFanLayout(cards);
    }

    toggleBtns.forEach(btn => {
      const active = btn.dataset.mode === mode;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });
}
