(() => {
  const gallery = document.querySelector('.screenshot-gallery');
  const controls = document.querySelector('.gallery-controls');
  const slider = document.getElementById('gallery-position');
  const previous = document.getElementById('gallery-previous');
  const next = document.getElementById('gallery-next');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  gallery.classList.add('enhanced');
  controls.hidden = false;
  const limit = () => Math.max(0, gallery.scrollWidth - gallery.clientWidth);
  function update() {
    const max = limit();
    slider.value = max ? gallery.scrollLeft / max * 100 : 0;
    slider.disabled = max === 0;
    previous.disabled = gallery.scrollLeft <= 1;
    next.disabled = gallery.scrollLeft >= max - 1;
  }
  function step(direction) {
    const card = gallery.querySelector('.screenshot-card');
    const distance = card.getBoundingClientRect().width + parseFloat(getComputedStyle(gallery).columnGap);
    gallery.scrollBy({ left: direction * distance, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  slider.addEventListener('input', () => { gallery.scrollLeft = Number(slider.value) / 100 * limit(); });
  gallery.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(gallery);
  update();

  const dialog = document.getElementById('image-viewer');
  const image = document.getElementById('viewer-image');
  const links = [...document.querySelectorAll('.app-preview a, .screenshot-card a')];
  let current = 0, opener, savedOverflow;
  function show(index) {
    current = (index + links.length) % links.length;
    const source = links[current].querySelector('img');
    image.src = source.src;
    image.alt = source.alt;
    const caption = links[current].closest('figure').querySelector('figcaption');
    document.getElementById('viewer-caption').textContent = caption
      ? [...caption.childNodes].map(node => node.textContent.trim()).filter(Boolean).join(' · ')
      : 'Your daily trail';
    document.getElementById('viewer-count').textContent = `${current + 1} / ${links.length}`;
  }
  links.forEach((link, index) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      event.preventDefault();
      opener = link;
      show(index);
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
    });
  });
  document.getElementById('viewer-close').addEventListener('click', () => dialog.close());
  document.getElementById('viewer-previous').addEventListener('click', () => show(current - 1));
  document.getElementById('viewer-next').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); show(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = savedOverflow;
    opener?.focus({ preventScroll: true });
  });
  let touchStart;
  image.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  image.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
})();
