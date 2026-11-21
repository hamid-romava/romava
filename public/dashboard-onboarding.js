const form = document.querySelector("main form");
const checkbox = form.querySelector('input[name="confirmed"]');
const button = form.querySelector("button");
const update = () => { button.disabled = !checkbox.checked; };
checkbox.addEventListener("change", update);
window.addEventListener("pageshow", update);
update();
