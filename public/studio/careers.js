const applicationForm = document.querySelector('#career-form');
const applicationStatus = document.querySelector('#career-status');
const applicationSubmit = applicationForm.querySelector('button[type="submit"]');

applicationForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (applicationSubmit.disabled) return;
  const data = new FormData(applicationForm);
  if (data.get('resume').size > 4_000_000) {
    applicationStatus.textContent = 'حجم رزومه باید کمتر از ۴ مگابایت باشه.';
    return;
  }
  applicationSubmit.disabled = true;
  applicationStatus.textContent = 'در حال ارسال رزومه…';
  try {
    const response = await fetch('/api/career-application', { method: 'POST', body: data });
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      applicationStatus.textContent = result?.error || 'درخواست ثبت نشد. دوباره امتحان کن.';
      return;
    }
    applicationForm.reset();
    applicationStatus.textContent = 'رزومه‌ات رسید. ممنون که برای پیوستن به تیم روماوا درخواست دادی.';
  } catch {
    applicationStatus.textContent = 'ارسال کامل نشد. دوباره امتحان کن.';
  } finally {
    applicationSubmit.disabled = false;
  }
});
