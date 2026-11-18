const track = document.querySelector('.culture-track');
const slides = [...track.children];
const controls = document.querySelector('.culture-controls');
const prev = controls.querySelector('[data-prev]');
const next = controls.querySelector('[data-next]');
const count = controls.querySelector('[data-count]');
const format = new Intl.NumberFormat('fa');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let current = 0;

function updateControls() {
  count.textContent = `${format.format(current + 1)} از ${format.format(slides.length)}`;
  prev.disabled = current === 0;
  next.disabled = current === slides.length - 1;
}

function move(offset) {
  const slide = slides[current + offset];
  if (!slide) return;
  track.scrollBy({
    left: slide.getBoundingClientRect().right - track.getBoundingClientRect().right,
    behavior: reducedMotion.matches ? 'instant' : 'smooth',
  });
}

track.addEventListener('scroll', () => {
  const edge = track.getBoundingClientRect().right;
  const closest = slides.reduce((best, slide, index) => {
    return Math.abs(slide.getBoundingClientRect().right - edge)
      < Math.abs(slides[best].getBoundingClientRect().right - edge) ? index : best;
  }, current);
  if (closest === current) return;
  current = closest;
  updateControls();
}, { passive: true });

prev.addEventListener('click', () => move(-1));
next.addEventListener('click', () => move(1));
track.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  move(event.key === 'ArrowLeft' ? 1 : -1);
});
updateControls();
controls.hidden = false;
