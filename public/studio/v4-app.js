// A normal sticky section, not a wheel-event trap: scroll also works backwards.
const advSection=document.querySelector('.adv-scroll'),advButtons=[...document.querySelectorAll('[data-adv]')],advPanels=[...document.querySelectorAll('[data-adv-panel]')];
const scrollAdvantages = matchMedia("(prefers-reduced-motion: no-preference)");
let advCurrent=-1,advQueued=false;
function showAdv(index){index=Math.max(0,Math.min(4,index));if(index===advCurrent)return;advCurrent=index;document.querySelectorAll('[data-taam]').forEach((letter,i)=>letter.classList.toggle('is-lit',i===(index===0?0:index===4?2:1)));advButtons.forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-pressed',String(i===index));b.closest('li').classList.toggle('is-current',i===index);b.closest('li').classList.toggle('is-before',i===index-1);b.closest('li').classList.toggle('is-after',i===index+1);b.closest('li').querySelector('.adv-description').setAttribute('aria-hidden',String(i!==index))});advPanels.forEach((p,i)=>{p.classList.toggle('active',i===index);p.setAttribute('aria-hidden',String(i!==index))});document.querySelector('.adv-progress>span').style.width=((index+1)*20)+'%'}
function updateAdv(){
 advQueued=false;
 if(!scrollAdvantages.matches){advSection.style.setProperty('--intro-opacity',0);advSection.style.setProperty('--items-opacity',1);if(advCurrent<0)showAdv(0);return;}
 const r=advSection.getBoundingClientRect(),travel=advSection.offsetHeight-innerHeight;
 const progress=Math.max(0,Math.min(1,-r.top/Math.max(1,travel)));
 const fade=Math.max(0,Math.min(1,(progress-.22)/.08));
 advSection.style.setProperty('--intro-opacity',1-fade);
 advSection.style.setProperty('--items-opacity',fade);
 advSection.style.setProperty('--word-joined',Math.max(0,Math.min(1,(progress-.10)/.05)));
 advSection.style.setProperty('--intro-shift',(-fade*28)+'px');
 advSection.style.setProperty('--letters-gap',(28*(1-Math.min(1,progress/.15)))+'px');
 advSection.classList.toggle('show-features',fade>.5);
 document.querySelector('.taam-introduction').setAttribute('aria-hidden',String(fade>=1));
 document.querySelector('.adv-shell').setAttribute('aria-hidden',String(fade===0));
 const features=Math.max(0,Math.min(1,(progress-.30)/.70));
 showAdv(Math.round(features*(advPanels.length-1)));
}
addEventListener('scroll',()=>{if(!advQueued){advQueued=true;requestAnimationFrame(updateAdv)}},{passive:true});addEventListener('resize',updateAdv);advButtons.forEach((b,i)=>b.addEventListener('click',()=>{const start=scrollY+advSection.getBoundingClientRect().top,travel=advSection.offsetHeight-innerHeight;if(!scrollAdvantages.matches){showAdv(i);return;}window.scrollTo({top:start+(.30+.70*i/Math.max(1,advPanels.length-1))*travel,behavior:'instant'});showAdv(i)}));updateAdv();
const caseRunway = document.querySelector('.case-runway');
const caseTrack = caseRunway.querySelector('.outcome-grid');
const caseCards = [...caseTrack.querySelectorAll('.outcome-card')];
const caseDots = [...document.querySelectorAll('[data-case]')];
const casePosition = document.querySelector('#case-position');
const caseNumbers = new Intl.NumberFormat('fa');
const scrollCases = matchMedia('(min-width: 900px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)');
const stickyTop = 24;
let caseCurrent = -1;
let caseFrame = 0;

function renderCases(position) {
  const index = Math.round(position);
  caseCards.forEach((card, i) => {
    const distance = i - position;
    card.style.setProperty('--case-offset', String(Math.max(-1, Math.min(1, distance))));
    card.style.setProperty('--case-opacity', String(Math.max(0, 1 - Math.abs(distance))));
  });

  if (index === caseCurrent) return;
  caseCurrent = index;
  caseCards.forEach((card, i) => {
    const active = i === index;
    card.classList.toggle('active', active);
    card.inert = !active;
    card.setAttribute('aria-hidden', String(!active));
    card.setAttribute('aria-label', `${caseNumbers.format(i + 1)} از ${caseNumbers.format(caseCards.length)}`);
  });
  caseDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
    dot.setAttribute('aria-pressed', String(i === index));
  });
  casePosition.textContent = `${caseNumbers.format(index + 1)} از ${caseNumbers.format(caseCards.length)}`;
}

function caseTravel() {
  return caseRunway.offsetHeight - caseRunway.firstElementChild.offsetHeight;
}

function selectCase(index) {
  const next = (index + caseCards.length) % caseCards.length;
  if (!scrollCases.matches || caseTravel() <= 0) {
    renderCases(next);
    return;
  }
  const start = scrollY + caseRunway.getBoundingClientRect().top - stickyTop;
  window.scrollTo({
    top: start + caseTravel() * (next + .5) / caseCards.length,
    behavior: 'smooth',
  });
}

function updateScrollCase() {
  if (!scrollCases.matches) return;
  const travel = caseTravel();
  if (travel <= 0) return;
  const progress = (stickyTop - caseRunway.getBoundingClientRect().top) / travel;
  const position = progress * caseCards.length - .5;
  renderCases(Math.max(0, Math.min(caseCards.length - 1, position)));
}

addEventListener('scroll', () => {
  if (!scrollCases.matches || caseFrame) return;
  caseFrame = requestAnimationFrame(() => {
    caseFrame = 0;
    updateScrollCase();
  });
}, { passive: true });
function syncCaseMode() {
  caseTrack.classList.toggle('case-scroll-motion', scrollCases.matches);
  if (scrollCases.matches) updateScrollCase();
  else renderCases(Math.max(0, caseCurrent));
}
scrollCases.addEventListener('change', syncCaseMode);
addEventListener('resize', syncCaseMode);

document.querySelector('#case-prev').addEventListener('click', () => selectCase(caseCurrent - 1));
document.querySelector('#case-next').addEventListener('click', () => selectCase(caseCurrent + 1));
caseDots.forEach(dot => dot.addEventListener('click', () => selectCase(Number(dot.dataset.case))));

let touchStart = null;
caseTrack.addEventListener('touchstart', event => {
  touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}, { passive: true });
caseTrack.addEventListener('touchend', event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    selectCase(caseCurrent + (dx > 0 ? 1 : -1));
  }
}, { passive: true });
renderCases(0);
caseTrack.classList.add('case-motion-ready');
syncCaseMode();
document.querySelectorAll('[data-open-lean]').forEach(a=>a.addEventListener('click',()=>{document.querySelector('#lean-cycle').open=true}));function openHashDisclosure(){if(location.hash==='#results')document.querySelector('#results').open=true}addEventListener('hashchange',openHashDisclosure);openHashDisclosure();

// Keep the bottom of taller sections visible before the next section covers them.
if (CSS.supports('timeline-scope: --chapter-cover')) {
  const chapters = [...document.querySelectorAll('.chapter-under')];
  function sizeChapter(chapter) {
    chapter.style.setProperty('--chapter-top', `${Math.min(0, innerHeight - chapter.offsetHeight)}px`);
  }
  const chapterObserver = new ResizeObserver(entries => {
    entries.forEach(({ target }) => sizeChapter(target));
  });
  chapters.forEach(chapter => {
    sizeChapter(chapter);
    chapterObserver.observe(chapter);
  });
  addEventListener('resize', () => chapters.forEach(sizeChapter));
}
