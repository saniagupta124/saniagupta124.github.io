/* =====================================================
   contact.js — contact form submit logic
   Uses Formspree endpoint from original site
   ===================================================== */

export function initContact() {
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('.btn-send');
    const originalText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const data = new FormData(form);
      const res  = await fetch('https://formspree.io/f/mqabwkov', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        status.textContent = '✓ Message sent — I\'ll be in touch!';
        status.style.color = 'var(--green)';
        form.reset();
      } else {
        throw new Error('Server error');
      }
    } catch {
      status.textContent = '✗ Something went wrong. Email me directly at saniagupta124@gmail.com';
      status.style.color = '#ff6b6b';
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}
