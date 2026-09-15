// ===== HEADER SCROLL =====
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 60;
  header.classList.toggle('scrolled', scrolled);
  backToTop.classList.toggle('visible', window.scrollY > 400);
  updateActiveNav();
});

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== MOBILE MENU =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navMenu.classList.toggle('open');
});

navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navMenu.classList.remove('open');
  });
});

// ===== ACTIVE NAV =====
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPos = window.scrollY + 100;
  sections.forEach(section => {
    const link = document.querySelector(`.nav-link[href="#${section.id}"]`);
    if (!link) return;
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    link.classList.toggle('active', scrollPos >= top && scrollPos < bottom);
  });
}

// ===== REVEAL ON SCROLL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== WORD REVEAL (HERO) =====
const wordObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.word-reveal').forEach((word, i) => {
        setTimeout(() => word.classList.add('visible'), i * 150);
      });
      wordObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.hero-title').forEach(el => wordObserver.observe(el));

// ===== COUNTERS =====
function animateCounter(el) {
  const target = +el.dataset.target;
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString('pt-BR');
    if (current >= target) clearInterval(timer);
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// ===== GALLERY SLIDER =====
const galleryTrack = document.getElementById('galleryTrack');
const galleryDotsEl = document.getElementById('galleryDots');
const galleryCounter = document.getElementById('galleryCounter');
const galleryPrevBtn = document.getElementById('galleryPrev');
const galleryNextBtn = document.getElementById('galleryNext');
const filterBtns = document.querySelectorAll('.filter-btn');

let allSlides = Array.from(galleryTrack.querySelectorAll('.gallery-slide'));
let visibleSlides = [...allSlides];
let currentGallery = 0;

function getVisibleSlides() {
  return allSlides.filter(s => !s.classList.contains('hidden'));
}

function buildGalleryDots() {
  galleryDotsEl.innerHTML = '';
  visibleSlides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i === currentGallery ? ' active' : '');
    d.setAttribute('aria-label', `Foto ${i + 1}`);
    d.addEventListener('click', () => goToGallery(i));
    galleryDotsEl.appendChild(d);
  });
}

function updateGalleryCounter() {
  if (galleryCounter) galleryCounter.textContent = `${currentGallery + 1} / ${visibleSlides.length}`;
}

function goToGallery(index) {
  currentGallery = (index + visibleSlides.length) % visibleSlides.length;
  const slideIndex = allSlides.indexOf(visibleSlides[currentGallery]);
  galleryTrack.style.transform = `translateX(-${slideIndex * 100}%)`;
  galleryDotsEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentGallery));
  updateGalleryCounter();
}

galleryPrevBtn.addEventListener('click', () => goToGallery(currentGallery - 1));
galleryNextBtn.addEventListener('click', () => goToGallery(currentGallery + 1));

// Filtros
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    const filter = btn.dataset.filter;
    allSlides.forEach(s => s.classList.toggle('hidden', filter !== 'all' && s.dataset.category !== filter));
    visibleSlides = getVisibleSlides();
    currentGallery = 0;
    goToGallery(0);
    buildGalleryDots();
  });
});

// Swipe touch
let touchStartX = 0;
galleryTrack.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
galleryTrack.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) goToGallery(currentGallery + (diff > 0 ? 1 : -1));
});

buildGalleryDots();
updateGalleryCounter();

// ===== LIGHTBOX =====
const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightboxContent');
const lightboxClose = document.getElementById('lightboxClose');

galleryTrack.querySelectorAll('.gallery-slide').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    if (!img) return;
    const fullImg = document.createElement('img');
    fullImg.src = img.src;
    fullImg.alt = img.alt;
    fullImg.style.cssText = 'max-width:90vw;max-height:80vh;border-radius:12px;display:block;';
    lightboxContent.innerHTML = '';
    lightboxContent.appendChild(fullImg);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ===== TESTIMONIALS SLIDER =====
const track = document.getElementById('testimonialsTrack');
const cards = track.querySelectorAll('.testimonial-card');
const dotsContainer = document.getElementById('sliderDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentSlide = 0;
let slidesPerView = getSlidesPerView();

function getSlidesPerView() {
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
}

function getTotalSlides() {
  return Math.ceil(cards.length / slidesPerView);
}

function buildDots() {
  dotsContainer.innerHTML = '';
  for (let i = 0; i < getTotalSlides(); i++) {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === currentSlide ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }
}

function goTo(index) {
  const total = getTotalSlides();
  currentSlide = (index + total) % total;
  const cardWidth = cards[0].offsetWidth;
  const gap = 32;
  track.style.transform = `translateX(-${currentSlide * slidesPerView * (cardWidth + gap)}px)`;
  dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

prevBtn.addEventListener('click', () => goTo(currentSlide - 1));
nextBtn.addEventListener('click', () => goTo(currentSlide + 1));

// Auto-play
let autoPlay = setInterval(() => goTo(currentSlide + 1), 5000);
track.addEventListener('mouseenter', () => clearInterval(autoPlay));
track.addEventListener('mouseleave', () => { autoPlay = setInterval(() => goTo(currentSlide + 1), 5000); });

window.addEventListener('resize', () => {
  const newSpv = getSlidesPerView();
  if (newSpv !== slidesPerView) {
    slidesPerView = newSpv;
    currentSlide = 0;
    buildDots();
    goTo(0);
  }
});

buildDots();

// ===== VIDEO SLIDER =====
const videoTrack = document.getElementById('videoTrack');
const videoDotsEl = document.getElementById('videoDots');
const videoPrev = document.getElementById('videoPrev');
const videoNext = document.getElementById('videoNext');
const videoSlides = videoTrack ? videoTrack.querySelectorAll('.video-slide') : [];
let currentVideo = 0;

if (videoSlides.length) {
  videoSlides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Vídeo ${i + 1}`);
    d.addEventListener('click', () => goToVideo(i));
    videoDotsEl.appendChild(d);
  });

  function goToVideo(index) {
    // pausa o video atual
    const current = videoSlides[currentVideo].querySelector('video');
    if (current) current.pause();
    currentVideo = (index + videoSlides.length) % videoSlides.length;
    videoTrack.style.transform = `translateX(-${currentVideo * 100}%)`;
    videoDotsEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentVideo));
  }

  videoPrev.addEventListener('click', () => goToVideo(currentVideo - 1));
  videoNext.addEventListener('click', () => goToVideo(currentVideo + 1));
}

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const original = btn.innerHTML;

  // Estado de loading
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = original;
    btn.disabled = false;
    e.target.reset();
    showSuccessModal();
  }, 1500);
});

function showSuccessModal() {
  const modal = document.getElementById('successModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

document.getElementById('successModalClose').addEventListener('click', () => {
  document.getElementById('successModal').classList.remove('open');
  document.body.style.overflow = '';
});

document.getElementById('successModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ===== SMOOTH SCROLL for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
