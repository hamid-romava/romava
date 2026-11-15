const contactDialog = document.querySelector('#contact');
const contactForm = document.querySelector('#contact-form');
const contactStatus = document.querySelector('#contact-status');
const submitContact = contactForm.querySelector('button[type="submit"]');
const collaboration = contactForm.elements.namedItem('collaboration');

document.querySelectorAll('[data-contact], [data-plan]').forEach(button => {
  button.addEventListener('click', () => {
    if (button.dataset.plan) collaboration.value = button.dataset.plan;
    contactStatus.textContent = '';
    contactDialog.showModal();
  });
});
contactDialog.querySelector('.close').addEventListener('click', () => contactDialog.close());

contactForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (submitContact.disabled) return;
  submitContact.disabled = true;
  contactStatus.textContent = 'در حال ثبت درخواست…';
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...Object.fromEntries(new FormData(contactForm)), source: 'studio' }),
    });
    if (response.status === 400) {
      const result = await response.json();
      contactStatus.textContent = result.error;
      return;
    }
    if (!response.ok) throw new Error('Contact submission failed');
    contactForm.reset();
    contactStatus.textContent = 'درخواستت ثبت شد. برای هماهنگی توی واتساپ بهت پیام می‌دیم.';
  } catch {
    contactStatus.textContent = 'درخواست ثبت نشد. دوباره امتحان کن.';
  } finally {
    submitContact.disabled = false;
  }
});
