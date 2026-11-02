const toggle=document.getElementById('grid-toggle');
toggle.addEventListener('click',()=>{const on=toggle.getAttribute('aria-pressed')!=='true';toggle.setAttribute('aria-pressed',String(on));toggle.innerHTML='<span class="toggle-dot"></span>شبکهٔ ساخت '+(on?'روشن':'خاموش')+' <span>↗</span>';document.querySelector('.drawing').classList.toggle('grid-off',!on)});
let timer;function toast(message){const t=document.getElementById('toast');t.textContent=message;t.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>t.classList.remove('show'),2400)}
document.querySelectorAll('[data-color]').forEach(button=>button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(button.dataset.color);toast('رنگ '+button.dataset.color+' کپی شد')}catch{toast('کد رنگ: '+button.dataset.color)}}));
document.getElementById('print-book').addEventListener('click',()=>window.print());
