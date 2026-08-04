/* =====================================================
   hero.js — Three.js particles, typewriter, hero animations
   ===================================================== */

export function initParticleCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const w = canvas.offsetWidth || window.innerWidth;
  const h = canvas.offsetHeight || window.innerHeight;
  renderer.setSize(w, h);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
  camera.position.z = 5;

  const COUNT = 150;
  const positions = new Float32Array(COUNT * 3);
  const colors    = new Float32Array(COUNT * 3);
  const navy  = new THREE.Color('#1A48A3');
  const green = new THREE.Color('#B8FF47');

  for (let i = 0; i < COUNT; i++) {
    positions[i*3]   = (Math.random() - 0.5) * 14;
    positions[i*3+1] = (Math.random() - 0.5) * 8;
    positions[i*3+2] = (Math.random() - 0.5) * 4;
    const c = Math.random() > 0.35 ? navy : green;
    colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({ size: 0.025, vertexColors: true, transparent: true, opacity: 0.5 });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);

  const orig = Float32Array.from(positions);
  let mx = 0, my = 0, tx = 0, ty = 0;

  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  window.addEventListener('resize', () => {
    const nw = canvas.offsetWidth, nh = canvas.offsetHeight;
    renderer.setSize(nw, nh);
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
  });

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const pos = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) pos[i*3+1] = orig[i*3+1] + Math.sin(t*0.3 + i*0.7)*0.08;
    geo.attributes.position.needsUpdate = true;
    tx += (mx-tx)*0.04; ty += (my-ty)*0.04;
    pts.rotation.y = -tx*0.12; pts.rotation.x = ty*0.08;
    renderer.render(scene, camera);
  })();
}

export function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const phrases = ['Startup Founder', 'Graphics Programmer', 'Software Engineer', 'Game Developer', 'AI Engineer'];
  const SPEED = 65; /* uniform rate for every character — type and delete */
  let pi = 0, ci = 0, del = false, pause = 0;

  function tick() {
    const cur = phrases[pi];

    if (!del) {
      el.textContent = cur.slice(0, ci);
      if (ci < cur.length) { ci++; return setTimeout(tick, SPEED); }
      /* Word complete — brief hold before deleting */
      if (++pause < 20) return setTimeout(tick, SPEED);
      pause = 0; del = true;
      return setTimeout(tick, SPEED);
    }

    /* Deleting: pre-decrement so the final step goes straight to ''
       without pausing on the first letter                          */
    if (ci > 0) {
      el.textContent = cur.slice(0, --ci);
      return setTimeout(tick, SPEED);
    }

    /* All cleared — pause then next word */
    del = false;
    pi  = (pi + 1) % phrases.length;
    setTimeout(tick, 300);
  }

  tick();
}

export function initHeroAnimations() {
  if (typeof gsap === 'undefined') return;

  /* ── Entrance animations ── */
  const titleEl = document.querySelector('.hero-title');
  if (titleEl) {
    const text = titleEl.textContent.trim();
    titleEl.innerHTML = text.split('').map(c =>
      c === ' '
        ? `<span class="gsap-hero-char" style="display:inline-block;width:0.3em;">&nbsp;</span>`
        : `<span class="gsap-hero-char">${c}</span>`
    ).join('');
    titleEl.classList.add('chars-ready');
    gsap.to('.gsap-hero-char', { y:0, opacity:1, duration:0.9, stagger:0.03, ease:'expo.out', delay:0.2 });
  }

  gsap.to('.hero-subtitle',    { y:0, opacity:1, duration:1, ease:'expo.out', delay:0.7  });
  gsap.to('.hero-tagline',     { y:0, opacity:1, duration:1, ease:'expo.out', delay:0.95 });
  const indicatorIntro =
  gsap.to('.scroll-indicator', { y:0, opacity:1, duration:1, ease:'expo.out', delay:1.3  });

  /* ── Scroll reveal animation ──
     CSS sticky holds the frame for 100vh of scroll (200vh hero - 100vh sticky).
     scrub:1.5 catches up fast enough that the reveal doesn't lag on quick scrolls.
     end: 'bottom bottom' = scrollY=100vh, exactly when CSS sticky releases.      */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start:   'top top',
      end:     'bottom bottom',
      scrub:   1, /* slight lag for feel, without leaving ghosts on nav jumps */
    },
    defaults: { ease: 'none' },
  });

  tl
    /* Hero text and decos fade over the first half of the scroll range;
       the empty padding tween extends the timeline so these fades don't
       stretch across the whole range. */
    .to('.hero-content', { opacity:0, y:-45 }, 0)
    .to('.hero-decos',   { opacity:0 },        0)
    .to({},              { duration: 0.5 },    0.5);

  /* Tint + blur overlay gets its own lag-free trigger, fully transparent by
     ~101vh — comfortably before the nav "Projects" landing point (125vh),
     so no fade ever covers the cards there. */
  gsap.to('#hero-tint', {
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: '5% top',   /* 12vh  */
      end:   '42% top',  /* 101vh */
      scrub: true,
    },
  });

  /* Projects label + view toggle + resume button get their own trigger with
     scrub:true (no smoothing lag) that completes at 120vh — before the nav
     "Projects" landing point (125vh). On the lagged main timeline, a nav
     jump would land with the title still mid-fade (gray) for ~2.5s. */
  const revealTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: '30% top',  /* 72vh  */
      end:   '50% top',  /* 120vh */
      scrub: true,
    },
    defaults: { ease: 'none' },
  });

  revealTl
    .to('.projects-reveal',   { opacity:1, pointerEvents:'auto' }, 0)
    .to('.view-toggle',       { opacity:1, pointerEvents:'auto' }, 0)
    .to('.cards-resume-link', { opacity:1, pointerEvents:'auto' }, 0);

  /* Scroll indicator ("PROJECTS ↓") — hard show/hide, not a scrubbed fade.
     Any scroll past ~5vh of the hero hides it (visibility:hidden via
     autoAlpha); returning to the top brings it back. overwrite:true kills
     the delayed entrance tween, which could otherwise fire AFTER a fast
     scroll had hidden the indicator and fade it back in over the cards. */
  ScrollTrigger.create({
    trigger: '#hero',
    start:   '2% top',
    onEnter: () => {
      indicatorIntro.kill();
      gsap.to('.scroll-indicator', { autoAlpha: 0, duration: 0.25, overwrite: true });
    },
    onLeaveBack: () => {
      gsap.to('.scroll-indicator', { autoAlpha: 1, y: 0, duration: 0.3, overwrite: true });
    },
  });

  /* Enable card interactivity.
     '30% top' of 220vh = 66vh from page top → scrollY ≈ 66vh.
     CSS sticky holds until 120vh, so cards remain on screen.
     At scrollY=66vh, animation is at ~55% progress → tint fully faded.  */
  ScrollTrigger.create({
    trigger:    '#hero',
    start:      '30% top',
    onEnter:    () => enableCards(true),
    onLeaveBack:() => enableCards(false),
  });
}

function enableCards(on) {
  /* Enable/disable pointer events on stage AND individual cards.
     The tint has pointer-events:none always (CSS), so clearing the
     stage and card blocks is sufficient.                              */
  const stage = document.getElementById('projects-stage');
  if (stage) stage.style.pointerEvents = on ? 'auto' : 'none';
  document.querySelectorAll('.project-card').forEach(c => {
    c.style.pointerEvents = on ? 'auto' : 'none';
  });
}
