(() => {
  const sheet = document.createElement('dialog');
  sheet.className = 'image-sheet';
  sheet.setAttribute('aria-label', 'نمایش تصویر کامل');
  const header = document.createElement('div');
  header.className = 'image-sheet-header';
  const title = document.createElement('span');
  title.textContent = 'تصویر کامل';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'image-sheet-close';
  close.setAttribute('aria-label', 'بستن تصویر');
  close.textContent = '×';
  header.append(title, close);
  const picture = document.createElement('img');
  picture.className = 'image-sheet-picture';
  sheet.append(header, picture);
  document.body.append(sheet);
  let previousOverflow = '';
  let closing = false;
  let openingFrame;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function dismiss() {
    if (!sheet.open || closing) return;
    closing = true;
    cancelAnimationFrame(openingFrame);
    sheet.classList.remove('is-open');
    setTimeout(() => {
      sheet.close();
      document.body.style.overflow = previousOverflow;
      picture.removeAttribute('src');
      closing = false;
    }, reduced.matches ? 0 : 280);
  }
  close.addEventListener('click', dismiss);
  sheet.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  sheet.addEventListener('click', event => {
    if (event.target !== sheet) return;
    const r = sheet.getBoundingClientRect();
    if (event.clientY < r.top || event.clientX < r.left || event.clientX > r.right || event.clientY > r.bottom) dismiss();
  });
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, location.href);
    if (!/\.(?:png|jpe?g|webp|avif|gif)$/i.test(url.pathname)) return;
    event.preventDefault();
    if (sheet.open) return;
    const thumbnail = link.querySelector('img');
    picture.alt = thumbnail?.alt || 'تصویر کامل';
    picture.src = url.href;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sheet.showModal();
    openingFrame = requestAnimationFrame(() => {
      openingFrame = requestAnimationFrame(() => sheet.classList.add('is-open'));
    });
  });
})();
