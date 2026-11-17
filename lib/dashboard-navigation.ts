const paths = {
 home:'M3 10l9-7 9 7v10H3zM9 20v-7h6v7',
 prep:'M5 5h14v15H5zM8 3v4m8-4v4m-8 6 3 3 5-6',
 meet:'M4 5h16v12H9l-5 4zM8 9h8m-8 4h5',
 menu:'M4 6h16M4 12h16M4 18h16',
 back:'m14 5-7 7 7 7',
 chart:'M4 4v16h16M8 16v-4m4 4V8m4 8v-6',
 inbox:'M4 5h16v15H4zM4 13h5l2 3h2l2-3h5',
 shoot:'M3 6h12v12H3zM15 10l6-3v10l-6-3',
} as const;
type Icon = keyof typeof paths;
type Tab = [href: string, label: string, icon: Icon];
const icon = (name: Icon) =>`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
const css=`
.app-header{display:grid!important;grid-template-columns:minmax(60px,1fr) minmax(0,2fr) minmax(60px,1fr);align-items:center;gap:8px}
.app-header>.app-brand,.app-header>.team-brand{grid-area:1/1;display:flex;align-items:center;gap:6px;min-width:0}
.app-brand img,.app-header .team-brand img{display:block;width:32px;max-width:100%}
.app-brand .brand-note{display:none}.app-header .account{display:none}
.app-header>.app-title,.app-header>h1{grid-area:1/2;margin:0;text-align:center;font-size:clamp(13px,3.2vw,19px);line-height:1.55;font-weight:700;overflow-wrap:anywhere;color:#26324a}
.app-header .month-picker{grid-area:2/1/3/-1}.app-header>.app-back{grid-area:1/3;justify-self:end}
.app-button{display:inline-grid;place-items:center;flex:none;width:44px;height:44px;padding:0;border:1px solid #dce3f0;border-radius:12px;color:#2847a8;background:white;font:inherit;text-decoration:none;cursor:pointer}
.app-tabs{position:fixed;inset:auto 0 0;z-index:30;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:3px;width:min(100%,560px);margin:auto;padding:7px 8px max(8px,env(safe-area-inset-bottom));border:1px solid #dde4f0;border-radius:18px 18px 0 0;background:white;box-shadow:0 -8px 28px #15243c12;color:#526078}
.app-tabs a{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:3px;min-height:52px;padding:3px;border-radius:11px;font-size:12px;line-height:1.4;text-align:center;color:inherit;text-decoration:none}.app-tabs a[aria-current]{background:#eef2ff;color:#244df0;font-weight:bold}
body:has(.app-tabs){padding-bottom:calc(80px + env(safe-area-inset-bottom))}
.app-drawer{position:fixed;inset:0 0 auto auto;width:min(340px,88vw);height:100dvh;max-height:none;margin:0;padding:20px;border:0;background:white;color:#26324a;overflow:auto}.app-drawer:popover-open,.team-menu:popover-open{display:flex;flex-direction:column}.app-drawer::backdrop{background:#101b3280}
.app-drawer-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}.app-drawer form,.team-menu form{margin-top:auto;padding-top:24px}
.app-drawer .app-link{display:block;width:100%;padding:10px 14px;border:1px solid #dce3f0;border-radius:11px;background:#f4f6fb;color:inherit;text-align:right;text-decoration:none;font:inherit}.app-link+.app-link{margin-top:8px}.app-drawer .history{margin:0 0 12px}
@media(prefers-reduced-motion:no-preference){.app-drawer:popover-open{animation:client-drawer-in .24s ease-out}@keyframes client-drawer-in{from{transform:translateX(100%)}to{transform:translateX(0)}}}
`;
const tabs = (items: Tab[], current: string) =>`<nav class="app-tabs" aria-label="منوی اصلی داشبورد">${items.map(([href,label,glyph])=>`<a href="${href}"${href===current?' aria-current="page"':''}>${icon(glyph)}<span>${label}</span></a>`).join('')}</nav>`;
const back = (href: string, label: string) =>`<a class="app-button app-back" href="${href}" aria-label="${label}">${icon('back')}</a>`;
export function clientNavigation(html: string, token: string, current: string) {
  const hero=html.match(/<header[^>]*>([\s\S]*?)<\/header>/);
  if(!hero)return html;
  const home='/r/'+token;
  const isMeeting=current==='/r/meeting';
  const archived=isMeeting?html.match(/<details class="history">[\s\S]*?<\/details>/)?.[0]:null;
  const context=isMeeting?html.match(/<p class="meeting-context" id="meeting-context">([\s\S]*?)<\/p>/):null;
  const brand=hero[1].match(/<a\b[^>]*href="\/"[^>]*>[\s\S]*?<\/a>/)?.[0].replace('romava-logo-focus.svg','romava-symbol-focus.svg');
  const picker=hero[1].match(/<form class="month-picker"[\s\S]*?<\/form>/)?.[0]??'';
  const title=context?.[1]??(({ '/r/preparation':'آمادگی روز آفیش','/r/plans':'طرح‌ها و قیمت‌ها','/r/meeting':'جلسه ماهانه' } as Record<string, string>)[current]??'گزارش عملکرد');
  const header=`<header class="topbar app-header"><div class="app-brand"><button class="app-button" type="button" popovertarget="client-drawer" aria-label="منوی بیشتر">${icon('menu')}</button>${brand??''}</div><p class="app-title"${isMeeting?' id="meeting-context"':''}>${title}</p>${current===home?'':back(home,'بازگشت به داشبورد')}${current===home?'<span id="accountName" hidden></span>':''}${picker}</header>`;
  const drawer=`<div id="client-drawer" class="app-drawer" popover><div class="app-drawer-head"><strong>منوی داشبورد</strong><button class="app-button" type="button" popovertarget="client-drawer" popovertargetaction="hide" aria-label="بستن منو">×</button></div>${archived??''}<a class="app-link" href="/r/plans">طرح‌ها و قیمت‌ها</a><a class="app-link" href="/">سایت روماوا</a><form method="post" action="${home}"><input type="hidden" name="action" value="logout"><button class="app-link">خروج از حساب</button></form></div>`;
  html=html.replace(hero[0],()=>header);
  if(archived)html=html.replace(archived,'');
  if(context)html=html.replace(context[0],'');
  return html.replace('</head>',`<style>${css}</style></head>`).replace('</body>',()=>drawer+tabs([[home,'گزارش عملکرد','home'],['/r/preparation','آمادگی آفیش','prep'],['/r/meeting','جلسه ماهانه و تمدید','meet']],current)+'</body>');
}

export function teamNavigationLayout(html: string, view: string, backToShoots: boolean) {
  if (!html.includes('id="team-menu"')) return html;
  const active = html.match(/href="\/team\/meetings\?view=([a-z]+)" aria-current="page"/)?.[1] ?? view;
  const team='/team/meetings';
  const logout=html.match(/<form method="post" action="\/team\/meetings">[\s\S]*?<\/form>/)?.[0];
  if(logout)html=html.replace(logout,'').replace('</nav>\n  </div>',()=>'</nav>'+logout.replace('>خروج<','>خروج از حساب<')+'</div>');
  html=html.replace(/(<nav class="team-nav team-menu-links"[^>]*>)[\s\S]*?<\/nav>/,(_all,open)=>open+'<a href="/team/meetings?view=qc">QC سایت</a></nav>');
  html=html.replace(/<header[^>]*>/,'<header class="app-header">')
    .replace(/<p><a href="\/team\/meetings\?view=shoots">← برگشت به آفیش‌ها<\/a><\/p>/,'');
  if(backToShoots)html=html.replace('</header>',()=>back(team+'?view=shoots','برگشت به آفیش‌ها')+'</header>');
  return html.replace('</head>',`<style>${css}</style></head>`).replace('</body>',()=>tabs([[team,'پاسخ جلسات','meet'],[team+'?view=requests','درخواست‌ها','inbox'],[team+'?view=analytics','آمار سایت','chart'],[team+'?view=shoots','چک‌لیست آفیش','shoot']],active?team+'?view='+active:team)+'</body>');
}
