(() => {
  const toggle = document.querySelector("#team-notification-toggle");
  const panel = document.querySelector("#team-notifications");
  const badge = document.querySelector("#team-notification-count");
  const list = document.querySelector("#team-notification-list");
  const status = document.querySelector("#team-notification-status");
  if (!toggle || !panel || !badge || !list || !status) return;

  const home = window.location.pathname;
  const key = "romava-team-notifications-read-v1";
  const date = new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "short", timeStyle: "short", timeZone: "Asia/Tehran",
  });
  const number = new Intl.NumberFormat("fa-IR");
  let items = [];
  let seen = new Set();
  let pending = false;

  function loadSeen() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(saved)) saved.forEach(id => seen.add(id));
    } catch {}
  }

  function render() {
    const unread = items.filter(item => !seen.has(item.id)).length;
    badge.hidden = unread === 0;
    badge.textContent = number.format(unread);
    toggle.setAttribute("aria-label", unread ? `نوتیفیکیشن‌ها، ${number.format(unread)} تازه` : "نوتیفیکیشن‌ها");
    status.textContent = items.length ? "" : "هنوز نوتیفیکیشنی نیست.";
    list.replaceChildren(...items.map(item => {
      const row = document.createElement("li");
      const link = document.createElement("a");
      const heading = document.createElement("strong");
      const time = document.createElement("small");
      link.href = item.view === "meetings" ? home : `${home}?view=${item.view}`;
      heading.textContent = item.name ? `${item.label} · ${item.name}` : item.label;
      time.textContent = date.format(item.time);
      link.append(heading, time);
      row.append(link);
      return row;
    }));
  }

  function markRead() {
    items.forEach(item => seen.add(item.id));
    seen = new Set(Array.from(seen).slice(-120));
    try { localStorage.setItem(key, JSON.stringify(Array.from(seen))); } catch {}
    render();
  }

  async function refresh() {
    if (pending) return;
    pending = true;
    try {
      const response = await fetch(`${home}?view=notification-feed`, { cache: "no-store" });
      if (!response.ok) throw new Error("Notifications unavailable");
      const data = await response.json();
      items = data.items;
      if (panel.matches(":popover-open")) markRead();
      else render();
    } catch {
      if (!items.length) status.textContent = "دریافت نوتیفیکیشن‌ها فعلاً ممکن نیست.";
    } finally {
      pending = false;
    }
  }

  loadSeen();
  panel.addEventListener("toggle", event => {
    if (event.newState !== "open") return;
    markRead();
    refresh();
  });
  window.addEventListener("storage", event => {
    if (event.key === key) { loadSeen(); render(); }
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh();
  });
  setInterval(() => { if (!document.hidden) refresh(); }, 30000);
  refresh();
})();
