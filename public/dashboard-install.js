const install = document.querySelector("#dashboard-install");
const button = install.querySelector("button");
const instructions = install.querySelector("p");
const appleMobile = /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const installed = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
let installPrompt;

if (!installed) {
  install.hidden = false;
  if (appleMobile) {
    instructions.textContent = "از منوی اشتراک‌گذاری مرورگر، «Add to Home Screen» رو بزن.";
  }
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    button.hidden = false;
    instructions.hidden = true;
  });
  button.addEventListener("click", async () => {
    const prompt = installPrompt;
    if (!prompt) return;
    installPrompt = null;
    button.hidden = true;
    instructions.hidden = false;
    try {
      const { outcome } = await prompt.prompt();
      if (outcome === "accepted") install.hidden = true;
    } catch {
      instructions.hidden = false;
    }
  });
  window.addEventListener("appinstalled", () => { install.hidden = true; });
}
