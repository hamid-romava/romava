(() => {
  const trigger = document.querySelector("#open-culture");
  const sheet = document.querySelector("#culture-sheet");
  const frame = document.querySelector("#culture-frame");
  if (!trigger || !sheet || !frame || typeof sheet.showModal !== "function") return;

  trigger.addEventListener("click", event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (!frame.hasAttribute("src")) frame.src = trigger.href;
    sheet.showModal();
  });

  sheet.addEventListener("close", () => trigger.focus({ preventScroll: true }));
  frame.addEventListener("load", () => {
    frame.contentDocument?.addEventListener("keydown", event => {
      if (event.key === "Escape" && sheet.open) {
        event.preventDefault();
        sheet.close();
      }
    });
  });
})();
