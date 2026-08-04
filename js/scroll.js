/* =====================================================
   scroll.js — native scroll + GSAP ScrollTrigger sync
   Lenis removed: it conflicted with native scroll events
   causing the jerk and page-shake on anchor navigation.
   macOS trackpad / momentum scroll is already smooth natively.
   ===================================================== */

export function initScroll() {
  /* Keep ScrollTrigger in sync with native scroll */
  window.addEventListener('scroll', () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
  }, { passive: true });

  /* Nav blur on main page */
  const nav = document.getElementById('main-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });
  }

  /* Return duck-typed object so callers don't need changes */
  return {
    on: () => {},
    scrollTo: (target, opts = {}) => {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;
      const offset = opts.offset ?? -80;
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: 'smooth' });
    },
  };
}
