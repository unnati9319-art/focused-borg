document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const currentSlideEl = document.getElementById('current-slide');
  const totalSlidesEl = document.getElementById('total-slides');
  const progressFill = document.getElementById('progress-fill');
  const restartBtn = document.getElementById('restart-btn');
  
  let currentSlideIndex = 0;
  const totalSlides = slides.length;

  // Initialize
  totalSlidesEl.textContent = totalSlides;
  updateSlides();

  function updateSlides() {
    slides.forEach((slide, index) => {
      slide.classList.remove('active', 'left', 'right');
      
      if (index === currentSlideIndex) {
        slide.classList.add('active');
      } else if (index < currentSlideIndex) {
        slide.classList.add('left');
      } else {
        slide.classList.add('right');
      }
    });

    // Update Counter & Controls
    currentSlideEl.textContent = currentSlideIndex + 1;
    prevBtn.disabled = currentSlideIndex === 0;
    nextBtn.disabled = currentSlideIndex === totalSlides - 1;

    // Update Progress
    const progress = ((currentSlideIndex) / (totalSlides - 1)) * 100;
    progressFill.style.width = `${progress}%`;
  }

  function goToNextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
      currentSlideIndex++;
      updateSlides();
    }
  }

  function goToPrevSlide() {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      updateSlides();
    }
  }

  // Event Listeners
  nextBtn.addEventListener('click', goToNextSlide);
  prevBtn.addEventListener('click', goToPrevSlide);

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      currentSlideIndex = 0;
      updateSlides();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      goToNextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrevSlide();
    }
  });

  // Touch swipe support (basic)
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      goToNextSlide(); // Swipe left -> Next
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      goToPrevSlide(); // Swipe right -> Prev
    }
  }
});
