document.addEventListener('DOMContentLoaded', () => {
  const slides   = Array.from(document.querySelectorAll('.slide'));
  const prevBtn  = document.getElementById('prev-btn');
  const nextBtn  = document.getElementById('next-btn');
  const restartBtn = document.getElementById('restart-btn');
  const progFill = document.getElementById('progress-fill');
  const curEl    = document.getElementById('cur');
  const totEl    = document.getElementById('tot');
  const topNav   = document.getElementById('top-nav');
  const dotNav   = document.getElementById('dot-nav');
  const deck     = document.getElementById('deck');

  const TOTAL    = slides.length;
  let current    = 0;
  let isAnimating = false;

  totEl.textContent = TOTAL;

  /* ─────────── Build dot nav ─────────── */
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Go to slide ${i + 1}`);
    d.setAttribute('role', 'button');
    d.setAttribute('tabindex', '0');
    d.addEventListener('click', () => goTo(i));
    d.addEventListener('keydown', e => e.key === 'Enter' && goTo(i));
    dotNav.appendChild(d);
  });

  /* ─────────── Counter animation ─────────── */
  function animCounter(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = '1';
    const target = parseInt(el.dataset.target, 10);
    const dur = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(e * target).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ─────────── Stagger animate-in elements ─────────── */
  function triggerAnims(slideEl) {
    // Reset
    slideEl.querySelectorAll('.anim').forEach(el => el.classList.remove('in'));

    requestAnimationFrame(() => {
      slideEl.querySelectorAll('.anim').forEach(el => {
        const delay = (parseFloat(el.dataset.d || 0)) * 110 + 60;
        setTimeout(() => el.classList.add('in'), delay);
      });
    });

    // Counters
    setTimeout(() => {
      slideEl.querySelectorAll('[data-target]').forEach(el => animCounter(el));
    }, 400);
  }

  /* ─────────── Update UI chrome ─────────── */
  function updateChrome() {
    // Counter
    curEl.textContent = current + 1;

    // Progress
    progFill.style.width = (current / (TOTAL - 1) * 100) + '%';

    // Buttons
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === TOTAL - 1;

    // Dot nav
    dotNav.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));

    // Dark mode nav
    const isDark = slides[current].dataset.dark === 'true';
    topNav.classList.toggle('dark', isDark);
    deck.classList.toggle('dark-nav', isDark);
  }

  /* ─────────── Core goTo ─────────── */
  function goTo(idx) {
    if (idx < 0 || idx >= TOTAL || idx === current || isAnimating) return;

    isAnimating = true;
    const outSlide = slides[current];
    const inSlide  = slides[idx];

    // Simply fade out → fade in (no transform fight)
    outSlide.classList.remove('active');

    // Small pause so out-fade is visible before in-fade
    setTimeout(() => {
      inSlide.classList.add('active');
      triggerAnims(inSlide);
      isAnimating = false;
    }, 180); // wait 180ms for fade-out

    current = idx;
    updateChrome();
  }

  /* ─────────── Initialise ─────────── */
  slides[0].classList.add('active');
  updateChrome();
  triggerAnims(slides[0]);

  /* ─────────── Button listeners ─────────── */
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  if (restartBtn) restartBtn.addEventListener('click', () => goTo(0));

  /* ─────────── Keyboard ─────────── */
  document.addEventListener('keydown', e => {
    if (e.target.matches('input,textarea,button,select')) return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowLeft')                   { e.preventDefault(); goTo(current - 1); }
  });

  /* ─────────── Touch swipe ─────────── */
  let touchX = 0;
  document.addEventListener('touchstart', e => { touchX = e.changedTouches[0].screenX; }, { passive: true });
  document.addEventListener('touchend',   e => {
    const diff = touchX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 60) goTo(diff > 0 ? current + 1 : current - 1);
  });

  /* ═══════════════ INTERACTIVE COMPONENTS ═══════════════ */

  /* ─── Accordion ─── */
  document.querySelectorAll('.acc-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.acc-item');
      // Close all
      document.querySelectorAll('.acc-item').forEach(i => i.classList.remove('open'));
      // Open clicked (toggle)
      if (item !== document.querySelector('.acc-item.open')) item.classList.add('open');
      // Re-evaluate
      const isOpen = item.classList.contains('open') ||
        [...document.querySelectorAll('.acc-item')].every(i => !i.classList.contains('open'));
      if (!item.classList.contains('open') && isOpen) item.classList.add('open');
    });
  });
  // Open first accordion item by default
  const firstAcc = document.querySelector('.acc-item');
  if (firstAcc) firstAcc.classList.add('open');

  /* ─── Feature Tabs ─── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const panelIdx = btn.dataset.tab;
      const container = btn.closest('.tabs');

      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      container.querySelector(`.tab-panel[data-panel="${panelIdx}"]`).classList.add('active');
    });
  });

  /* ─── Stat cards: keyboard hover reveal ─── */
  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter') card.classList.toggle('focused');
    });
  });
});
