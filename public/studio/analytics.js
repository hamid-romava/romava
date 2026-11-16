(() => {
  const measurementId = 'G-0J0PJQKYNZ';
  const allowedHosts = ['www.romavastudio.ir', 'romavastudio.ir'];
  if (!allowedHosts.includes(location.hostname)) return;

  function testModeEnabled() {
    return document.cookie.split(';').some(cookie => cookie.trim() === 'romava_ga_test=1');
  }
  if (testModeEnabled()) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', measurementId, { send_page_view: false });
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.append(tag);

  // Keep query strings and form fields out of the custom events.
  const send = (event) => {
    if (!testModeEnabled()) gtag('event', event, { page_location: location.origin + location.pathname });
  };
  window.romavaAnalyticsEvent = send;
  send('romava_home_view');

  const pending = new Set([25, 50, 75, 90]);
  function measureScroll() {
    const range = document.documentElement.scrollHeight - window.innerHeight;
    if (range <= 0 || window.scrollY <= 0) return;
    const depth = window.scrollY / range * 100;
    for (const percent of pending) {
      if (depth < percent) continue;
      send('romava_scroll_' + percent);
      pending.delete(percent);
    }
    if (!pending.size) window.removeEventListener('scroll', measureScroll);
  }
  window.addEventListener('scroll', measureScroll, { passive: true });
})();
