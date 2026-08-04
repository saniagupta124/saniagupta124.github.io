/* =====================================================
   main.js — orchestrates all modules
   ===================================================== */
import { initScroll }                                         from './scroll.js';
import { initParticleCanvas, initTypewriter, initHeroAnimations } from './hero.js';
import { initProjects }                                       from './projects.js';
import { initContact }                                        from './contact.js';

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  /* ScrollTrigger works off native scroll — no Lenis needed */
  ScrollTrigger.config({ ignoreMobileResize: true });

  const scroll = initScroll();

  initCursor();
  initParticleCanvas();
  initTypewriter();
  initHeroAnimations();
  initProjects();
  initScrollAnimations();
  initContact();
  initMobileNav();
  initAnchorLinks(scroll);

  /* Refresh triggers after fonts + images settle */
  window.addEventListener('load', () => ScrollTrigger.refresh());
});

/* ── Custom cursor ── */
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  document.addEventListener('mousemove', e => {
    dot.style.left  = ring.style.left = e.clientX + 'px';
    dot.style.top   = ring.style.top  = e.clientY + 'px';
  });

  const sel = 'a, button, [role="button"], .project-card, input, textarea, label';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(sel)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(sel)) document.body.classList.remove('cursor-hover');
  });
}

/* ── Scroll-triggered section animations ── */
function initScrollAnimations() {
  /* Section titles — simple opacity+y, no clip-path
     Use fromTo so elements are visible if GSAP never runs */
  gsap.utils.toArray('.gsap-clip-reveal, .gsap-fade-up:not(#hero *)').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%' } }
    );
  });

  /* Bio lines */
  gsap.utils.toArray('.gsap-fade-up-sm').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', delay: i * 0.07,
        scrollTrigger: { trigger: el, start: 'top 90%' } }
    );
  });

  /* Experience rows */
  gsap.utils.toArray('.experience-row').forEach((row, i) => {
    gsap.fromTo(row,
      { opacity: 0, y: 35 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', delay: i * 0.09,
        scrollTrigger: { trigger: row, start: 'top 88%' } }
    );
  });
}

/* ── Mobile nav ── */
function initMobileNav() {
  const btn = document.getElementById('nav-hamburger');
  const mob = document.getElementById('nav-mobile');
  if (!btn || !mob) return;

  btn.addEventListener('click', () => {
    const open = mob.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mob.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mob.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ── Smooth anchor links ──
   Uses native window.scrollTo({ behavior:'smooth' }) which doesn't
   conflict with anything and never causes a page shake. */
function initAnchorLinks(scroll) {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      /* Offset: nav height (72px) + small breathing room */
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}
