/* =====================================================
   project-media.js — gallery video behavior
   Videos play (muted, looping) only once scrolled into
   view, and pause when scrolled away. Clicking a video
   toggles play/pause — a manual pause sticks until the
   viewer clicks again. Videos longer than 20s get a
   draggable timeline scrubber injected.
   ===================================================== */

const SCRUB_THRESHOLD = 20;   /* seconds */
const VISIBLE_RATIO   = 0.35; /* how much of the video must be on screen to play */

export function initProjectMedia() {
  const videos = document.querySelectorAll('.video-wrap video');
  if (!videos.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target: video, isIntersecting }) => {
      if (isIntersecting) {
        if (!video._userPaused) {
          video.play().catch(() => {});
          video.closest('.video-wrap').classList.remove('is-paused');
        }
      } else {
        video.pause();
      }
    });
  }, { threshold: VISIBLE_RATIO });

  videos.forEach(video => {
    const wrap = video.closest('.video-wrap');

    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video._userPaused = false;

    observer.observe(video);

    wrap.addEventListener('click', () => {
      if (video.paused) {
        video._userPaused = false;
        video.play().catch(() => {});
        wrap.classList.remove('is-paused');
      } else {
        video._userPaused = true;
        video.pause();
        wrap.classList.add('is-paused');
      }
    });

    const maybeAddScrubber = () => {
      if (!video.duration || video.duration <= SCRUB_THRESHOLD || wrap.querySelector('.video-scrub')) return;

      const bar = document.createElement('input');
      bar.type = 'range';
      bar.min = '0';
      bar.max = '1000';
      bar.value = '0';
      bar.className = 'video-scrub';
      bar.setAttribute('aria-label', 'Video timeline');
      wrap.appendChild(bar);

      let scrubbing = false;

      video.addEventListener('timeupdate', () => {
        if (!scrubbing) bar.value = String((video.currentTime / video.duration) * 1000);
      });

      bar.addEventListener('pointerdown', () => { scrubbing = true; });
      bar.addEventListener('pointerup',   () => { scrubbing = false; });
      bar.addEventListener('input', () => {
        video.currentTime = (Number(bar.value) / 1000) * video.duration;
      });
      /* Scrubber clicks shouldn't toggle play/pause */
      bar.addEventListener('click', e => e.stopPropagation());
    };

    if (video.readyState >= 1) maybeAddScrubber();
    else video.addEventListener('loadedmetadata', maybeAddScrubber);
  });
}
