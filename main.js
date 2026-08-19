document.addEventListener('DOMContentLoaded', () => {
  const slides    = Array.from(document.querySelectorAll('.slide'));
  const prevBtn   = document.getElementById('prev-btn');
  const nextBtn   = document.getElementById('next-btn');
  const restartBtn= document.getElementById('restart-btn');
  const progFill  = document.getElementById('progress-fill');
  const curEl     = document.getElementById('cur');
  const topNav    = document.getElementById('top-nav');
  const dotNav    = document.getElementById('dot-nav');
  const body      = document.body;

  const TOTAL = slides.length;
  let current = 0;
  let busy    = false;

  /* ─── Build dot indicators ─── */
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('role', 'button');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.setAttribute('tabindex', '0');
    d.addEventListener('click', () => goTo(i));
    d.addEventListener('keydown', e => e.key === 'Enter' && goTo(i));
    dotNav.appendChild(d);
  });

  /* ─── Animated counter ─── */
  function animCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = parseInt(el.dataset.target, 10);
    const dur = 1500;
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4); // ease-out-quart
      el.textContent = Math.round(e * target).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  /* ─── Stagger-in animations on a slide ─── */
  function triggerAnims(slideEl) {
    slideEl.querySelectorAll('.anim').forEach(el => el.classList.remove('in'));
    slideEl.querySelectorAll('[data-target]').forEach(el => delete el.dataset.done);

    // small delay so slide is visible first
    setTimeout(() => {
      slideEl.querySelectorAll('.anim').forEach(el => {
        const delay = (parseFloat(el.dataset.d || 0)) * 110 + 50;
        setTimeout(() => el.classList.add('in'), delay);
      });
    }, 80);

    setTimeout(() => {
      slideEl.querySelectorAll('[data-target]').forEach(el => animCounter(el));
    }, 450);
  }

  /* ─── Chrome update ─── */
  function updateChrome() {
    curEl.textContent = current + 1;
    progFill.style.width = (current / (TOTAL - 1) * 100) + '%';
    prevBtn.disabled = (current === 0);
    nextBtn.disabled = (current === TOTAL - 1);

    dotNav.querySelectorAll('.dot').forEach((d, i) =>
      d.classList.toggle('active', i === current));

    const isDark = slides[current].dataset.dark === 'true';
    topNav.classList.toggle('dark', isDark);
    body.classList.toggle('dark-arrows', isDark);
  }

  /* ─── CORE NAVIGATION — z-index fade, NO transform conflict ─── */
  function goTo(idx) {
    if (idx === current || idx < 0 || idx >= TOTAL || busy) return;
    busy = true;

    const out = slides[current];
    const inn = slides[idx];

    // Step 1: mark outgoing as "prev" (keeps it visible at z:5 while fading)
    out.classList.remove('active');
    out.classList.add('prev');

    // Step 2: bring incoming to top and fade it in
    inn.classList.add('active');

    // Step 3: after transition, clean up prev
    setTimeout(() => {
      out.classList.remove('prev');
      busy = false;
    }, 600); // match CSS transition duration

    current = idx;
    updateChrome();
    triggerAnims(inn);
  }

  /* ─── Init ─── */
  slides[0].classList.add('active');
  updateChrome();
  triggerAnims(slides[0]);

  /* ─── Button listeners ─── */
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  if (restartBtn) restartBtn.addEventListener('click', () => goTo(0));

  /* ─── Keyboard ─── */
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowLeft')                   { e.preventDefault(); goTo(current - 1); }
  });

  /* ─── Touch swipe ─── */
  let tx = 0;
  document.addEventListener('touchstart', e => { tx = e.changedTouches[0].screenX; }, { passive: true });
  document.addEventListener('touchend',   e => {
    const d = tx - e.changedTouches[0].screenX;
    if (Math.abs(d) > 55) goTo(d > 0 ? current + 1 : current - 1);
  });

  /* ═══════ INTERACTIVE COMPONENTS ═══════ */

  /* ── Accordion ── */
  document.querySelectorAll('.acc-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.acc-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.acc-item.open').forEach(i => i.classList.remove('open'));
      // Open this if it wasn't open
      if (!isOpen) item.classList.add('open');
    });
  });
  // Start first open
  const firstAcc = document.querySelector('.acc-item');
  if (firstAcc) firstAcc.classList.add('open');

  /* ── Tabs ── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx    = btn.dataset.tab;
      const root   = btn.closest('.tabs');
      root.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      root.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      root.querySelector(`.tab-panel[data-panel="${idx}"]`).classList.add('active');
    });
  });
});
