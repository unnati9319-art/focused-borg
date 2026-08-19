document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const restartBtn = document.getElementById('restart-btn');
  const currentSlideEl = document.getElementById('current-slide');
  const progressFill = document.getElementById('progress-fill');
  const keyboardHint = document.getElementById('keyboard-hint');

  let currentIndex = 0;
  const total = slides.length;

  /* ── Initial state ── */
  slides[0].classList.add('active');
  updateUI();

  /* ── Animated counter ── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ── Trigger stagger animations on active slide ── */
  function triggerAnimations(slideEl) {
    const items = slideEl.querySelectorAll('.animate-in');
    items.forEach(el => { el.classList.remove('visible'); el.style.transitionDelay = '0s'; });

    setTimeout(() => {
      items.forEach((el) => {
        const delay = parseFloat(el.dataset.delay || 0) * 120;
        setTimeout(() => { el.classList.add('visible'); }, delay);
      });
    }, 80);

    // Trigger stat counters
    setTimeout(() => {
      slideEl.querySelectorAll('.stat-number[data-target]').forEach(el => animateCounter(el));
    }, 350);
  }

  /* ── Go to slide ── */
  function goTo(newIndex) {
    if (newIndex < 0 || newIndex >= total) return;

    const outgoing = slides[currentIndex];
    const incoming = slides[newIndex];

    // Determine direction
    const direction = newIndex > currentIndex ? 1 : -1;

    // Exit outgoing
    outgoing.classList.remove('active');
    outgoing.classList.add(direction > 0 ? 'exit-left' : 'exit-right');
    setTimeout(() => outgoing.classList.remove('exit-left', 'exit-right'), 750);

    // Set incoming starting position
    incoming.style.transform = direction > 0 ? 'translateX(60px)' : 'translateX(-60px)';
    incoming.style.opacity = '0';
    incoming.classList.add('active');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        incoming.style.transform = 'translateX(0)';
        incoming.style.opacity = '1';
      });
    });

    currentIndex = newIndex;
    updateUI();
    triggerAnimations(incoming);
    hideKeyboardHint();
  }

  function updateUI() {
    const padded = String(currentIndex + 1).padStart(2, '0');
    currentSlideEl.textContent = padded;
    const progress = (currentIndex / (total - 1)) * 100;
    progressFill.style.width = `${progress}%`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === total - 1;

    // Invert slide-info text on dark slides
    const theme = slides[currentIndex].dataset.theme;
    const slideInfo = document.querySelector('.slide-info');
    const navBtns = document.querySelectorAll('.nav-btn');
    if (theme === 'hero' || theme === 'dark-accent') {
      slideInfo.style.color = 'rgba(255,255,255,0.4)';
      navBtns.forEach(b => {
        b.style.background = 'rgba(255,255,255,0.08)';
        b.style.borderColor = 'rgba(255,255,255,0.12)';
        b.style.color = 'rgba(255,255,255,0.7)';
      });
    } else {
      slideInfo.style.color = '';
      navBtns.forEach(b => { b.style.background = ''; b.style.borderColor = ''; b.style.color = ''; });
    }
  }

  /* ── Keyboard hint auto-hide ── */
  let hintHidden = false;
  function hideKeyboardHint() {
    if (!hintHidden) {
      hintHidden = true;
      keyboardHint.style.opacity = '0';
      setTimeout(() => keyboardHint.style.display = 'none', 400);
    }
  }

  /* ── Event listeners ── */
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));
  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  if (restartBtn) restartBtn.addEventListener('click', () => goTo(0));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goTo(currentIndex + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentIndex - 1); }
  });

  // Touch / swipe
  let touchStartX = 0;
  document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; });
  document.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 60) diff > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
  });

  // Trigger animations on first slide immediately
  triggerAnimations(slides[0]);
});
