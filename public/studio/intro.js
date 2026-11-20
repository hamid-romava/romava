import { createTheatre } from './theatre-scene.js?v=8';

const intro = document.querySelector('.theatre-intro');
const viewport = intro.querySelector('.intro-canvas');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const replay = document.querySelector('[data-replay-intro]');
const progressBar = intro.querySelector('.intro-progress span');
let theatre;
let frame;
let targetProgress = 0;
let currentProgress = 0;
let currentPointerX = 0;
let currentPointerY = 0;
let targetPointerX = 0;
let targetPointerY = 0;
let lastFrame = 0;
let inView = true;
let entered = false;
let landing = false;
const aperture = document.createElement('div');
aperture.className = 'intro-aperture';
aperture.setAttribute('aria-hidden', 'true');
const ns = 'http://www.w3.org/2000/svg';
const iris = document.createElementNS(ns, 'svg');
iris.setAttribute('viewBox', '-100 -100 200 200');
iris.setAttribute('preserveAspectRatio', 'xMidYMid slice');
const blades = Array.from({ length: 8 }, (_, i) => {
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('fill', i % 2 ? '#313827' : '#293022');
  path.setAttribute('stroke', '#a58b73');
  path.setAttribute('stroke-width', '.22');
  iris.append(path);
  return path;
});
const foreground = document.createElement('div');
foreground.className = 'intro-foreground';
foreground.setAttribute('aria-hidden', 'true');
const nearLayers = ['left', 'right', 'arch'].map((side) => {
  const image = document.createElement('img');
  image.src = '/studio/v4-assets/scene-frame.png';
  image.alt = '';
  image.className = 'near-' + side;
  foreground.append(image);
  return image;
});
intro.querySelector('.intro-sticky').append(foreground);
aperture.append(iris);
intro.querySelector('.intro-sticky').append(aperture);
function drawAperture(progress) {
  const pass = Math.max(0, Math.min(1, (progress - .09) / .25));
  const glide = pass * pass * (3 - 2 * pass);
  nearLayers.forEach((layer, i) => {
    const side = i === 0 ? -1 : i === 1 ? 1 : 0;
    layer.style.transform = `translate3d(${side * glide * 65}%, ${i === 2 ? -glide * 55 : glide * 8}%, 0) scale(${1.15 + glide * (i === 2 ? 2.6 : 1.8)})`;
    layer.style.opacity = String(1 - Math.max(0, (pass - .65) / .35));
  });
  const t = Math.max(0, Math.min(1, progress / .19));
  const opening = t * t * (3 - 2 * t);
  const radius = 5 + opening * 190;
  const point = (r, a) => [Math.cos(a) * r, Math.sin(a) * r].join(',');
  blades.forEach((blade, i) => {
    const a = i * Math.PI / 4 + (1 - opening) * .65;
    const b = a + Math.PI / 4;
    blade.setAttribute('d', `M ${point(radius, a)} L ${point(310, a - .3)} L ${point(310, b - .3)} L ${point(radius, b)} Z`);
  });
  aperture.style.opacity = String(1 - Math.max(0, (t - .8) / .2));
}
drawAperture(0);
const finalPicture = intro.querySelector('.intro-final-image');

async function dismissEntry() {
  if (entered || landing) return;
  landing = true;
  cancelAnimationFrame(frame);
  frame = undefined;
  const landingFrame = document.createElement('div');
  landingFrame.className = 'entry-landing-frame';
  const picture = document.createElement('img');
  picture.src = finalPicture.currentSrc || finalPicture.src;
  picture.alt = '';
  landingFrame.append(picture);
  document.body.append(landingFrame);
  try { await picture.decode(); } catch {}
  // Keep the final frame full-screen until the real hero is ready underneath.
  // Never move a detached copy of the image across the page.
  const settle = landingFrame.animate([
    { opacity: Number(finalPicture.style.opacity || 0) },
    { opacity: 1 },
  ], { duration: reducedMotion.matches ? 0 : 300, easing: 'ease-out', fill: 'forwards' });
  try { await settle.finished; } catch {}
  entered = true;
  intro.hidden = true;
  window.scrollTo({ top: 0, behavior: 'instant' });
  history.replaceState(null, '', location.pathname + location.search + '#site-start');
  await new Promise(requestAnimationFrame);
  const animation = landingFrame.animate([
    { opacity: 1 },
    { opacity: 0 },
  ], {
    duration: reducedMotion.matches ? 0 : 900,
    easing: 'cubic-bezier(.4,0,.2,1)',
    fill: 'forwards',
  });
  try { await animation.finished; } catch {}
  landingFrame.remove();
  document.body.classList.remove('entry-landing', 'entry-revealing');
  landing = false;
}

function measure() {
  if (entered || landing || intro.hidden) return;
  const rect = intro.getBoundingClientRect();
  const distance = Math.max(1, intro.offsetHeight - innerHeight);
  const rawProgress = -rect.top / distance;
  targetProgress = Math.max(0, Math.min(1, rawProgress));
  // Start the landing while the stage is still pinned, before its edge slides away.
  if (rawProgress > .995) dismissEntry();
}

function render(now) {
  frame = undefined;
  if (!theatre || entered || landing || !inView || document.hidden || reducedMotion.matches) return;
  const delta = Math.min((now - lastFrame) / 1000 || .016, .05);
  lastFrame = now;
  const damping = 1 - Math.exp(-delta * 6);
  currentProgress += (targetProgress - currentProgress) * damping;
  currentPointerX += (targetPointerX - currentPointerX) * damping;
  currentPointerY += (targetPointerY - currentPointerY) * damping;
  theatre.setPointer(currentPointerX, currentPointerY);
  drawAperture(currentProgress);
  theatre.render(Math.max(0, (currentProgress - .08) / .92) * 11);
  intro.dataset.progress = currentProgress.toFixed(3);
  const pictureArrival = Math.max(0, Math.min(1, (currentProgress - .86) / .13));
  finalPicture.style.opacity = pictureArrival * pictureArrival * (3 - 2 * pictureArrival);
  viewport.style.opacity = 1 - pictureArrival;
  progressBar.style.transform = 'scaleX(' + currentProgress + ')';
  frame = requestAnimationFrame(render);
}

function wake() {
  if (!frame && theatre && !entered && !landing && inView && !document.hidden && !reducedMotion.matches) {
    lastFrame = performance.now();
    frame = requestAnimationFrame(render);
  }
}

async function initialise() {
  if (reducedMotion.matches || theatre) return;
  intro.hidden = false;
  try {
    theatre = await createTheatre(viewport);
    measure();
    currentProgress = targetProgress;
    viewport.classList.add('is-ready');
    wake();
  } catch (error) {
    intro.hidden = true;
    console.warn('Theatre preview unavailable', error);
  }
}

addEventListener('scroll', () => { measure(); wake(); }, { passive: true });
addEventListener('resize', () => { measure(); wake(); }, { passive: true });
intro.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse') return;
  targetPointerX = event.clientX / innerWidth * 2 - 1;
  targetPointerY = -(event.clientY / innerHeight * 2 - 1);
});
intro.addEventListener('pointerleave', () => { targetPointerX = 0; targetPointerY = 0; });
intro.querySelector('.intro-skip').addEventListener('click', (event) => {
  event.preventDefault();
  dismissEntry();
});
replay.addEventListener('click', () => {
  if (landing) return;
  entered = false;
  drawAperture(0);
  finalPicture.style.opacity = '0';
  viewport.style.opacity = '1';
  intro.hidden = reducedMotion.matches;
  currentProgress = 0;
  targetProgress = 0;
  history.replaceState(null, '', location.pathname + location.search + '#theatre-entry');
  intro.scrollIntoView({ behavior: 'instant' });
  if (!theatre) initialise();
  measure();
  wake();
});
new IntersectionObserver((entries) => {
  inView = entries[0].isIntersecting;
  if (!inView) { cancelAnimationFrame(frame); frame = undefined; }
  else wake();
}).observe(intro);
document.addEventListener('visibilitychange', wake);
reducedMotion.addEventListener('change', () => {
  intro.hidden = reducedMotion.matches;
  if (reducedMotion.matches) { cancelAnimationFrame(frame); frame = undefined; }
  else if (theatre) { measure(); wake(); }
  else initialise();
});
if (location.hash && location.hash !== '#theatre-entry') {
  entered = true;
} else {
  initialise();
}
