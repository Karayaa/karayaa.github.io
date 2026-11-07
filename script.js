// Nav border on scroll
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Mobile / tablet menu toggle
  const navToggle = nav.querySelector('.nav-toggle');
  const navLinks = nav.querySelector('.nav-links');
  if (navToggle && navLinks) {
    const setOpen = (open) => {
      nav.classList.toggle('nav-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    navToggle.addEventListener('click', () => setOpen(!nav.classList.contains('nav-open')));
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) { setOpen(false); navToggle.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('nav-open') && !nav.contains(e.target)) setOpen(false);
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }
}

// Reveal observer
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal, .word-reveal').forEach(el => io.observe(el));

// Filter (homepage)
const filterBtns = document.querySelectorAll('.filter-btn');
const projects = document.querySelectorAll('.project');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    projects.forEach(p => {
      const show = f === 'all' || p.dataset.cat === f;
      p.style.display = show ? 'grid' : 'none';
    });
  });
});

// Hover preview (homepage)
const preview = document.getElementById('preview');
const previewImg = document.getElementById('previewImg');
const isDesktop = () => window.matchMedia('(min-width: 901px) and (hover: hover)').matches;

if (preview && previewImg) {
  projects.forEach(p => {
    p.addEventListener('mouseenter', () => {
      if (!isDesktop()) return;
      const src = p.dataset.preview;
      if (!src) return;
      if (previewImg.src !== location.origin + '/' + src) previewImg.src = src;
      preview.classList.add('active');
    });
    p.addEventListener('mouseleave', () => preview.classList.remove('active'));
  });

  document.addEventListener('mousemove', (e) => {
    if (!preview.classList.contains('active')) return;
    const x = e.clientX + 20;
    const y = e.clientY - 150;
    const maxX = window.innerWidth - 320;
    const maxY = window.innerHeight - 320;
    preview.style.left = Math.min(x, maxX) + 'px';
    preview.style.top = Math.max(20, Math.min(y, maxY)) + 'px';
  });
}

// =============================================
// GALLERY / SLIDER (case study pages)
// =============================================
const galleryTrack = document.getElementById('galleryTrack');
if (galleryTrack) {
  const slides = galleryTrack.querySelectorAll('.gallery-slide');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  const dotsWrap = document.getElementById('galleryDots');
  const counter = document.getElementById('galleryCounter');
  let current = 0;
  const total = slides.length;

  // Build dots
  if (dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  function update() {
    galleryTrack.style.transform = `translateX(-${current * 100}%)`;
    if (counter) counter.textContent = `${String(current + 1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
    if (dotsWrap) {
      dotsWrap.querySelectorAll('.gallery-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === total - 1;
  }
  function goTo(i) { current = Math.max(0, Math.min(total - 1, i)); update(); }
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Touch swipe
  let startX = 0;
  galleryTrack.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  galleryTrack.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
  });

  update();
}

// =============================================
// VIDEO EMBED LAZY LOAD
// =============================================
const videoPlaceholder = document.getElementById('videoPlaceholder');
const videoWrap = document.getElementById('videoWrap');
if (videoPlaceholder && videoWrap) {
  videoPlaceholder.addEventListener('click', () => {
    const videoId = videoWrap.dataset.videoId;
    if (!videoId) return;
    const iframe = document.createElement('iframe');
    const origin = location.protocol !== 'file:' ? `&origin=${encodeURIComponent(location.origin)}` : '';
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0${origin}`;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.title = 'Project video';
    videoPlaceholder.replaceWith(iframe);
  });
}
