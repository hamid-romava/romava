// A normal sticky section, not a wheel-event trap: scroll also works backwards.
const advSection=document.querySelector('.adv-scroll'),advButtons=[...document.querySelectorAll('[data-adv]')],advPanels=[...document.querySelectorAll('[data-adv-panel]')];
const scrollAdvantages = matchMedia("(prefers-reduced-motion: no-preference)");
let advCurrent=-1,advQueued=false;
function showAdv(index){index=Math.max(0,Math.min(4,index));if(index===advCurrent)return;advCurrent=index;advButtons.forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-pressed',String(i===index))});advPanels.forEach((p,i)=>{p.classList.toggle('active',i===index);p.setAttribute('aria-hidden',String(i!==index))});document.querySelector('.adv-progress>span').style.width=((index+1)*20)+'%'}
function updateAdv(){advQueued=false;if(!scrollAdvantages.matches){if(advCurrent<0)showAdv(0);return;}const r=advSection.getBoundingClientRect(),travel=advSection.offsetHeight-innerHeight;showAdv(Math.floor(Math.max(0,Math.min(.9999,-r.top/Math.max(1,travel)))*5))}
addEventListener('scroll',()=>{if(!advQueued){advQueued=true;requestAnimationFrame(updateAdv)}},{passive:true});addEventListener('resize',updateAdv);advButtons.forEach((b,i)=>b.addEventListener('click',()=>{const start=scrollY+advSection.getBoundingClientRect().top,travel=advSection.offsetHeight-innerHeight;if(!scrollAdvantages.matches){showAdv(i);return;}window.scrollTo({top:start+(i+.35)*travel/5,behavior:'instant'});showAdv(i)}));updateAdv();
const caseCards=[...document.querySelectorAll('.case-carousel .outcome-card')],caseDots=[...document.querySelectorAll('[data-case]')];let caseCurrent=0;
function showCase(i){caseCurrent=(i+caseCards.length)%caseCards.length;caseCards.forEach((c,n)=>{c.classList.toggle('active',n===caseCurrent);c.setAttribute('aria-hidden',String(n!==caseCurrent));c.setAttribute('aria-label',`${n+1} از ${caseCards.length}`)});caseDots.forEach((d,n)=>{d.classList.toggle('active',n===caseCurrent);d.setAttribute('aria-pressed',String(n===caseCurrent))});document.querySelector('#case-position').textContent=new Intl.NumberFormat('fa').format(caseCurrent+1)+' از ۳'}
const caseRunway = document.querySelector('.case-runway');
const caseTrack = caseRunway.querySelector('.outcome-grid');
const scrollCases = matchMedia('(min-width: 900px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)');
const stickyTop = 24;

function caseTravel() {
  return caseRunway.offsetHeight - caseRunway.firstElementChild.offsetHeight;
}

function selectCase(index) {
  showCase(index);
  if (!scrollCases.matches) return;
  const start = scrollY + caseRunway.getBoundingClientRect().top - stickyTop;
  const progress = (caseCurrent + 0.5) / caseCards.length;
  window.scrollTo({ top: start + caseTravel() * progress, behavior: 'instant' });
}

function updateScrollCase() {
  if (!scrollCases.matches || caseRunway.getBoundingClientRect().top > stickyTop) return;
  const travel = caseTravel();
  if (travel <= 0) return;
  const progress = (stickyTop - caseRunway.getBoundingClientRect().top) / travel;
  const index = Math.min(caseCards.length - 1, Math.floor(progress * caseCards.length));
  if (index !== caseCurrent) showCase(index);
}

let caseFrame = 0;
addEventListener('scroll', () => {
  if (caseFrame) return;
  caseFrame = requestAnimationFrame(() => {
    caseFrame = 0;
    updateScrollCase();
  });
}, { passive: true });
addEventListener('resize', updateScrollCase);

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
showCase(0);
updateScrollCase();
document.querySelectorAll('[data-open-lean]').forEach(a=>a.addEventListener('click',()=>{document.querySelector('#lean-cycle').open=true}));function openHashDisclosure(){if(location.hash==='#results')document.querySelector('#results').open=true}addEventListener('hashchange',openHashDisclosure);openHashDisclosure();
