import { pricedPlans, defaultPricing } from "./pricing-plans";
import { renewalPrice, shootDateLeadDays } from "@/lib/meeting-booking";
const agenda = [
  { title: "اول ببینیم این ماه چی کار کردیم", text: "گزارش عملکرد پیج رو با هم می‌بینیم؛ چی خوب پیش رفته و چی ازش یاد گرفتیم." },
  { title: "بعد یه گپ درباره همکاری‌مون", text: "اگه جایی نیاز به هماهنگی بیشتری داشته باشیم، درباره‌اش حرف می‌زنیم تا ماه بعد راحت‌تر با هم جلو بریم." },
  { title: "برای ماه بعد چی توی چنته داریم؟", text: "ایده‌ها و پیشنهادهای محتوایی‌مون رو می‌گیم و مسیر ماه بعد رو با هم می‌چینیم." },
  { title: "حالا میکروفن دست توئه!", text: "بگو از چی راضی بودی، چی می‌تونست بهتر باشه و چه ایده‌هایی داری." },
];
const prompts = [
  { id: "liked", category: "چیزهای خوب", title: "چی به دلت نشست؟", text: "کدوم محتوا یا کدوم بخش همکاری رو دوست داشتی؟ چندتا مثال آماده کن.", placeholder: "مثلاً این ویدیو رو خیلی دوست داشتم، چون…" },
  { id: "improve", category: "جای بهترشدن", title: "کجا توی ذوقت خورد؟", text: "چی اون‌جوری که می‌خواستی نشد؟ یادداشتش کن که با هم درباره‌اش حرف بزنیم.", placeholder: "دوست داشتم این بخش بهتر پیش بره…" },
  { id: "results", category: "خبرهای پشت پیج", title: "از پشت صحنه پیج خبر بده!", text: "کسی گفته از اینستاگرام پیدات کرده؟ پیام، تماس یا مراجعه‌ای داشتی؟ هر چی می‌دونی با خودت بیار؛ عدد دقیق هم نداشتی اشکالی نداره.", placeholder: "این ماه چند نفر گفتن از پیج پیدام کردن…" },
  { id: "next-month", category: "اتفاق‌های پیش رو", title: "رویداد یا اتفاقی در پیش داری که ما باید ازش خبر داشته باشیم؟", text: "مثلاً افتتاح شعبه، اضافه‌شدن یه خدمت، شرکت توی همایش، پیشنهاد ویژه یا تعطیلی مطب. اگه توی ماه آینده چنین خبری داری، موضوع و تاریخش رو بنویس تا برای محتوا و زمان انتشارش هماهنگ بشیم.", placeholder: "مثلاً ۲۰ ماه آینده، خدمت جدیدمون رو معرفی می‌کنیم…" },
  { id: "ideas", category: "ایده‌های تو", title: "ایده‌هات رو بریز روی کاغذ", text: "یه لیست از موضوع‌هایی که دوست داری بسازیم آماده کن. پست یا ویدیویی هم دیدی که خوشت اومده، لینکش رو بیار.", placeholder: "۱. دوست دارم درباره…\n۲. این ویدیو رو ببینین: …" },
] as const;

const stepIcons = {
  chart: "M4 4v16h16M8 16v-4m4 4V8m4 8v-6",
  liked: "M12 20 4.8 13a4.5 4.5 0 0 1 6.4-6.3l.8.8.8-.8a4.5 4.5 0 0 1 6.4 6.3Z",
  improve: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9 10h.01M15 10h.01M8.5 16a4 4 0 0 1 7 0",
  results: "M4 5h16v12H9l-5 4zM8 9h8m-8 4h5",
  future: "M4 18 10 12l4 4 6-9m-6 0h6v6",
  plan: "m3 8 9-5 9 5-9 5zM3 12l9 5 9-5M3 16l9 5 9-5",
  calendar: "M5 5h14v15H5zM8 3v4m8-4v4M5 10h14",
  payment: "M3 6h18v12H3zM3 10h18M7 15h3",
  "next-month": "M5 5h14v15H5zM8 3v4m8-4v4m-7 8h6m-3-3v6",
  ideas: "M9 19h6m-5 3h4M9 16c0-2-3-3-3-7a6 6 0 0 1 12 0c0 4-3 5-3 7z",
  agenda: "M8 5h8m-8 0V3h8v2m-8 0H5v16h14V5h-3M8 10h8m-8 5h6",
  review: "M20 11v8H4V5h12M8 12l3 3 9-9",
} as const;

function stepIcon(name: keyof typeof stepIcons, attributes = "") {
  return `<span class="setup-icon" aria-hidden="true" ${attributes}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${stepIcons[name]}"/></svg></span>`;
}

export function meetingTemplate(token: string, storageId: string, cycle: string, csrf: string, reportMonth = 1, pricing = defaultPricing) {
  const meetingPlans = pricedPlans(pricing);
  const formatPrice = (amount: number) => new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(amount) + " تومان";
  const planCards = meetingPlans.map(plan => {
    const quarterlyTotal = renewalPrice(plan, 3);
    const savings = plan.priceToman * 3 - quarterlyTotal;
    return `<label class="plan-option"><input type="radio" name="plan" value="${plan.id}" required data-booking><strong>${plan.name}</strong><small class="plan-purpose">${plan.purpose}</small><small class="plan-cost"><span class="monthly-cost">${formatPrice(plan.priceToman)}</span>${savings > 0 ? `<span class="quarterly-cost"><del aria-label="قیمت ماهانه قبل از تخفیف: ${formatPrice(plan.priceToman)}">${formatPrice(plan.priceToman)}</del><b>${formatPrice(quarterlyTotal / 3)} در ماه</b><span class="plan-savings">در سه ماه ${formatPrice(savings)} کمتر می‌پردازی</span></span>` : ''}</small></label>`;
  }).join("");
  const discounts = meetingPlans.filter(plan => plan.discount > 0).map(plan => `${plan.name} ${new Intl.NumberFormat("fa-IR").format(plan.discount)}٪`).join(" و ");
  const futureStep = 4;
  const bookingStepIndex = futureStep + 1;
  const agendaStep = bookingStepIndex + 3;
  const stepLabels = ["مرور ماه قبل", ...prompts.slice(0, 3).map(item => item.title), "برنامه ماه بعد", "انتخاب طرح و زمان آفیش", ...prompts.slice(3).map(item => item.title), "برنامه جلسه", "مرور و ثبت جلسه"];
  const total = agendaStep + 2;
  const monthName = (n: number) => ["", "اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم", "دهم", "یازدهم", "دوازدهم"][n] || new Intl.NumberFormat("fa-IR").format(n);
  const meetingTitle = `بررسی ماه ${monthName(reportMonth)} و تمدید ماه ${monthName(reportMonth + 1)}`;
  const promptPanel = (item: typeof prompts[number], index: number) => `<section class="sheet step" data-panel="${index}" hidden tabindex="-1" aria-labelledby="heading-${item.id}"><div class="prompt"><div class="setup-heading">${stepIcon(item.id)}<h2 id="heading-${item.id}">${item.title}</h2></div><p>${item.text}</p><label class="note-label" for="note-${item.id}">جوابت رو بنویس <small>اجباری</small></label><textarea id="note-${item.id}" data-note="${item.id}" required aria-describedby="error-${item.id}" maxlength="6000" placeholder="${item.placeholder}"></textarea><label class="ready"><input type="checkbox" data-ready="${item.id}" required aria-describedby="error-${item.id}">این مورد رو برای جلسه آماده کردم</label><p class="booking-error" id="error-${item.id}" role="alert" hidden></p></div></section>`;
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>جلسه ماهانه | روماوا</title><link rel="icon" href="/brand/romava-symbol-focus.svg" type="image/svg+xml"><style>
@font-face{font-family:Yekan;src:url('/fonts/YekanBakh-Regular.ttf');font-weight:400;font-display:swap}@font-face{font-family:Yekan;src:url('/fonts/YekanBakh-Bold.ttf');font-weight:700;font-display:swap}*{box-sizing:border-box}body{margin:0;background:#f7f8fa;color:#20242d;font-family:Yekan,Arial,sans-serif;line-height:1.9}a{color:inherit;text-decoration:none}button,textarea,input{font:inherit}button,a,input{touch-action:manipulation}button{cursor:pointer}button:disabled{cursor:default;opacity:.4}button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #a9b9ff;outline-offset:4px}[hidden]{display:none!important}.page{width:min(1000px,calc(100% - 48px));margin:auto}.topbar{min-height:96px;display:flex;align-items:center;justify-content:space-between;gap:24px;border-bottom:1px solid #e5e8ef}.brand img{width:112px;display:block}.back{font-size:12px;color:#687695;white-space:nowrap}.workspace{max-width:820px;margin:34px auto 0}.kicker{text-align:left;font-size:11px;color:#7e899f;margin-bottom:12px}.steps{display:flex;gap:7px;margin:0 0 24px}.step-dot{flex:1;border:0;border-radius:20px;height:6px;background:#e4e8f1;padding:0;min-height:6px;position:relative}.step-dot::before{content:'';position:absolute;inset:-8px 0}.step-dot[aria-current="step"]{background:#2855f5}.step-dot.visited{background:#9eaff1}.sheet{background:#fff;border:1px solid #e3e7f0;border-radius:25px;overflow:hidden;box-shadow:0 12px 45px #28365304}.sheet-intro{padding:32px 36px 24px;background:linear-gradient(120deg,#edf1ff,#f9faff 65%,#fff6dc);border-bottom:1px solid #e9ecf5}.eyebrow{font-size:11px;color:#6e7fa9}.eyebrow::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:#2855f5;margin-left:8px}h1,h2{letter-spacing:-.5px}h1{font-size:34px;margin:12px 0 8px;line-height:1.6}h1 span{color:#2855f5}h2{font-size:29px;margin:12px 0;line-height:1.6}.lead{font-size:13px;color:#788295;margin:0;max-width:600px}.agenda{padding:22px 36px 28px;list-style:none;margin:0;display:grid;gap:0}.agenda li{display:flex;align-items:flex-start;gap:16px;padding:17px 0;border-bottom:1px solid #eff1f5}.agenda li:last-child{border:0;padding-bottom:0}.number{display:grid;place-items:center;flex:none;width:30px;height:30px;border:1px solid #dce4ff;background:#f3f6ff;color:#2855f5;border-radius:10px;font-size:12px}.agenda h3{font-size:14px;margin:0 0 5px}.agenda p{font-size:12px;color:#7b8495;margin:0;line-height:2}.prompt{padding:34px 36px}.prompt-tag{font-size:11px;color:#7b89a8;display:flex;gap:10px;align-items:center}.prompt-index{font:11px Arial,sans-serif;letter-spacing:.12em;color:#b2bad0}.prompt p{font-size:14px;color:#7a8394;line-height:2.1;max-width:610px}.note-label{display:block;margin:26px 0 10px;font-size:12px;color:#6d7891}.note-label small{font-size:10px;color:#a0a7b5;margin-right:6px}textarea{width:100%;min-height:150px;resize:vertical;border:1px solid #e0e5ef;border-radius:13px;background:#f9fafc;padding:16px;color:#303b50;font-size:13px;line-height:2;display:block}textarea::placeholder{color:#a7aebc}.ready{display:flex;align-items:center;gap:10px;margin-top:18px;font-size:12px;color:#667696;cursor:pointer}.ready input{width:20px;height:20px;accent-color:#2855f5;flex:none;margin:0}.footnav{display:flex;justify-content:space-between;align-items:center;gap:18px;margin:22px 0 12px}.button{border:1px solid #dce2ef;border-radius:11px;padding:11px 22px;background:#fff;font-size:12px;min-height:46px;color:#67738d}.primary{background:#2855f5;color:#fff;border-color:#2855f5}.save-note{font-size:10px;color:#8f98a9;margin:0 0 28px;text-align:center}.summary{padding:30px 36px}.summary-heading{padding:30px 36px;background:linear-gradient(120deg,#edf1ff,#fff7df);border-bottom:1px solid #e7ebf4}.summary-heading p{font-size:13px;color:#788295}.review{padding:18px 0;border-bottom:1px solid #edf0f6}.review:last-child{border:0}.review-top{display:flex;align-items:center;justify-content:space-between;gap:16px}.review h3{font-size:14px;margin:0}.edit{color:#2855f5;background:none;border:0;font-size:11px;padding:7px 0;min-height:36px}.review-text{font-size:12px;color:#7c8698;white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0 0}.review-status{font-size:10px;color:#8e99ae}.review-status.done{color:#2855f5}.closing{font-size:13px;color:#65749d;padding-top:18px}.footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e6e9f0;padding:25px 0 32px;font-size:10px;color:#98a0b1}.footer span:last-child{font:10px Arial,sans-serif;letter-spacing:.15em}.step:focus{outline:none}.noscript{padding:18px;background:#fff3ce;border-radius:12px}.meeting-mark{display:inline-flex;gap:6px;margin-bottom:5px}.meeting-mark i{display:block;width:18px;height:18px;border:1px solid #bbc9f5;border-radius:50%}.meeting-mark i:last-child{margin-right:-12px;background:#f8e4a0;border-color:#e8d28d}@media(max-width:650px){.page{width:calc(100% - 32px)}.topbar{min-height:80px;gap:12px}.brand img{width:90px}.back{font-size:11px}.workspace{margin-top:22px}.sheet{border-radius:20px}.sheet-intro,.prompt,.summary-heading,.summary{padding:25px 23px}h1{font-size:28px}h2{font-size:25px}.agenda{padding:10px 23px 24px}.agenda li{gap:12px;padding:16px 0}.agenda h3{font-size:13px}.agenda p{font-size:12px}.prompt p{font-size:13px}.note-label{margin-top:22px}.footnav{gap:12px}.button{padding:10px 16px;font-size:11px}.lead{font-size:12px}.steps{margin-bottom:18px}.save-note{line-height:2}.review-top{gap:10px}.review h3{font-size:13px}}@media(prefers-reduced-motion:no-preference){.step{animation:appear .2s ease-out}@keyframes appear{from{opacity:.5;transform:translateY(5px)}to{opacity:1;transform:none}}}
.cloud-save{border-top:1px solid #e2e7f1;padding:20px 0 0;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:12px}.cloud-save .save-note{width:100%;margin:0 0 12px}#load-server{font-size:11px}
.history{margin-bottom:24px;border:1px solid #e1e6ef;border-radius:14px;background:#fff;padding:14px 18px;font-size:12px}.history summary{cursor:pointer;color:#65759a}.history p{color:#8b94a6}.history-item{display:block;width:100%;text-align:right;background:transparent;border:0;border-top:1px solid #eef0f5;padding:13px 0;color:#52658d;font-size:12px}.history-item:first-child{margin-top:12px}textarea:read-only{background:#f1f4fa}
.phases{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-bottom:22px;padding:5px;border:1px solid #e2e7f1;background:#edf0f6;border-radius:13px}.phases button{font:inherit;font-size:12px;padding:12px 8px;border:0;border-radius:9px;background:transparent;color:#758199}.phases button[aria-pressed="true"]{background:#fff;color:#2855f5;font-weight:bold;box-shadow:0 2px 8px #20365b08}.preparation-label{font-size:11px!important;color:#2855f5!important;margin:0 0 24px!important;border-bottom:1px solid #e8edf7;padding-bottom:13px}
.booking-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.booking-grid label{display:block;font-size:12px;color:#64738c}.booking-grid select,.booking-grid input{display:block;width:100%;min-height:48px;border:1px solid #dce3f0;background:#f9fafc;border-radius:11px;padding:10px;color:#263650;font:inherit;margin-top:8px}.booking-grid input{direction:ltr}.plan-options{border:0;padding:0;margin:24px 0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.plan-options legend{font-size:13px;margin-bottom:12px}.plan-option{display:block;cursor:pointer;border:1px solid #dfe5f0;border-radius:13px;padding:16px 12px}.plan-option:has(input:checked){background:#eef3ff;border-color:#2855f5}.plan-option input{accent-color:#2855f5}.plan-option strong{font-size:17px;margin-right:7px}.plan-option small{display:block;font-size:10px;color:#74819a;margin-top:8px}.booking-note{padding:13px 16px;border-radius:11px;background:#edf2ff;color:#506da4!important;font-size:12px!important}.meeting-context{font-size:14px;color:#536ba3;margin:0 0 18px}.booking-error{color:#a43636!important;font-size:12px!important}.phases button{overflow-wrap:anywhere} @media(max-width:650px){.booking-grid{grid-template-columns:1fr}.plan-options{gap:6px}.plan-option{padding:12px 8px}.plan-option strong{font-size:15px}.phases button{font-size:10px;padding:10px 3px}}
.date-picker{display:block;width:100%;min-height:48px;border:1px solid #dce3f0;background:#f9fafc;border-radius:11px;padding:10px;color:#263650;font:inherit;margin-top:8px;text-align:right}.calendar{border:1px solid #dce3f0;border-radius:18px;padding:20px;width:min(350px,calc(100% - 32px));color:#263650;box-shadow:0 20px 80px #20365b30}.calendar::backdrop{background:#17203d55}.calendar-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.calendar-top button,.calendar-close{border:0;background:#edf2ff;color:#2855f5;border-radius:8px;padding:7px 12px;font:inherit}.calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;text-align:center}.calendar-grid span{font-size:11px;color:#8290a7;padding:7px 0}.calendar-grid button{aspect-ratio:1;border:0;border-radius:9px;background:#f1f4fb;color:#263650;font:inherit;font-size:13px}.calendar-grid button:disabled{opacity:.25}.calendar-grid button[aria-pressed="true"]{background:#2855f5;color:white}.calendar-grid .today{box-shadow:inset 0 0 0 1px #8da6f8}.calendar-close{display:block;margin:16px auto 0}.calendar-help{font-size:11px;color:#76849c;margin:0 0 12px}

.step{scroll-margin-top:16px}
.plans-sheet{position:fixed;inset:auto 0 0;margin:0 auto;padding:0;width:min(100%,920px);height:94dvh;max-width:none;max-height:none;border:1px solid #dce3f0;border-bottom:0;border-radius:22px 22px 0 0;background:#f5f4f0;color:#26324a;overflow:hidden}
.plans-sheet[open]{display:grid;grid-template-rows:auto minmax(0,1fr)}
.plans-sheet::backdrop{background:#17203d66}
.plans-sheet-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 16px;border-bottom:1px solid #e1e6ef;background:#fff}
.plans-sheet-bar button{width:44px;height:44px;border:1px solid #dce3f0;border-radius:12px;background:#fff;color:#2847a8;font:inherit;font-size:24px;cursor:pointer}
.plans-sheet iframe{width:100%;height:100%;min-height:0;border:0}
html:has(.plans-sheet[open]){overflow:hidden}
@media(prefers-reduced-motion:no-preference){.plans-sheet[open]{animation:plans-sheet-in .28s ease-out}@keyframes plans-sheet-in{from{transform:translateY(100%)}to{transform:translateY(0)}}}
.quarterly-cost{display:none}
.plan-options.is-quarterly .plan-cost:has(.quarterly-cost) .monthly-cost{display:none}
.plan-options.is-quarterly .quarterly-cost{display:grid;gap:3px}
.quarterly-cost del{color:#65748a}
.quarterly-cost b{color:#20304b;font-size:12px}
.plan-savings{color:#087452;font-weight:700}
.booking-stage-indicator{color:#67758d;font-size:12px;margin:0 0 8px}
.booking-stage h2{margin:0 0 12px}
.booking-stage .booking-grid{margin-top:16px}
@media(max-width:560px){
  .booking-stage .plan-options{grid-template-columns:1fr}
  .booking-stage .plan-option{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:2px 9px;padding:10px 12px}
  .booking-stage .plan-option strong,.booking-stage .plan-option small{margin:0}
  .booking-stage .plan-purpose{grid-column:2}
  .booking-stage .plan-cost{grid-column:3;grid-row:1 / span 2}
  .booking-stage .is-quarterly .plan-cost:has(.quarterly-cost){grid-column:2 / -1;grid-row:auto}
}
.setup-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:#edf2ff;color:#2855f5;flex:none}.setup-heading{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}.setup-heading h1,.setup-heading h2{margin:0}.setup-intro .setup-heading{justify-content:center}.setup-intro{text-align:center;padding-block:clamp(38px,9vw,84px)}.setup-intro .edit{display:inline-block;margin-top:12px}
</style></head><body><div class="page"><header class="topbar"><a class="brand" href="/" aria-label="سایت روماوا"><img src="/brand/romava-logo-focus.svg" alt="روماوا"></a><a class="back" href="/r/${token}">بازگشت به داشبورد ←</a></header><main class="workspace"><details class="history"><summary>جلسه‌های قبلی <span id="history-count"></span></summary><div id="history-list"><p>در حال دریافت جلسه‌ها…</p></div></details><p class="meeting-context" id="meeting-context">${meetingTitle}</p><nav class="phases" aria-label="سه بخش جلسه"><button type="button" data-step="0" id="phase-preparation">ماهی که گذشت</button><button type="button" data-step="${futureStep}" id="phase-booking">ماه پیش رو</button><button type="button" data-step="${agendaStep}" id="phase-agenda">برنامه جلسه</button></nav><div class="kicker"><span id="step-count" aria-live="polite">۱ از ۱۰</span></div><nav class="steps" aria-label="قدم‌های جلسه">${stepLabels.map((label,i)=>`<button type="button" class="step-dot" data-step="${i}" aria-label="${label}"${i===0?' aria-current="step"':''}></button>`).join('')}</nav><noscript><p class="noscript">برای دیدن قدم‌های بعدی و ذخیره یادداشت‌ها، جاوااسکریپت مرورگرت باید روشن باشه.</p></noscript><section class="sheet step" data-panel="0" tabindex="-1" aria-labelledby="past-title"><div class="prompt setup-intro"><div class="setup-heading">${stepIcon("chart")}<h2 id="past-title">اول بیا دربارهٔ ماهی که گذشت گپ بزنیم.</h2></div><p>گزارش‌هات رو دیدی؟ اگه دوست داری، قبل از جواب دادن یه نگاه بهشون بنداز.</p><a class="edit" id="open-reports" href="/r/${token}?view=monthly" aria-haspopup="dialog">دیدن گزارش‌ها</a></div></section>
${prompts.slice(0,3).map((item,i)=>promptPanel(item,i+1)).join('')}
<section class="sheet step" data-panel="${futureStep}" hidden tabindex="-1" aria-labelledby="future-title"><div class="prompt setup-intro"><div class="setup-heading">${stepIcon("future")}<h2 id="future-title">بیا ماه بعد رو با هم بچینیم.</h2></div><p>اول طرحت رو انتخاب کن. بعد از خبرها و ایده‌هات برای ماه بعد بگو.</p></div></section>
<section class="sheet step" data-panel="${bookingStepIndex}" hidden tabindex="-1" aria-labelledby="booking-title"><div class="prompt"><div class="booking-stage-indicator" id="booking-stage-count" aria-live="polite">۱ از ۳</div><div class="setup-heading">${stepIcon("plan", "data-booking-icon")}${stepIcon("calendar", "data-booking-icon hidden")}${stepIcon("payment", "data-booking-icon hidden")}<h2 id="booking-title" tabindex="-1">طرح تمدیدت رو انتخاب کن</h2></div><form id="booking-form"><div class="booking-stage" data-booking-stage><a class="edit" id="open-plans" href="/r/plans" aria-haspopup="dialog">جزئیات و قیمت طرح‌ها</a><fieldset class="plan-options"><legend>طرح ماه بعدت</legend>${planCards}</fieldset><div class="booking-grid"><label for="renewal-months">مدت تمدید<select id="renewal-months" data-booking><option value="1">ماهانه</option><option value="3">سه‌ماهه با تخفیف</option></select></label></div><p class="booking-note" id="quarterly-note" hidden>برای سه ماه، ۶ آفیش داری. دو آفیش برای ماه اول در نظر گرفتیم و ۴ آفیش باقی‌مونده رو بعداً تیم باهات هماهنگ می‌کنه.${discounts ? ` تمدید سه‌ماهه برای ${discounts} تخفیف داره.` : ""}</p></div><div class="booking-stage" data-booking-stage hidden><div class="booking-grid"><label for="shoot-date">روز پیشنهادی آفیش<input id="shoot-date" type="hidden" data-booking><button type="button" class="date-picker" id="shoot-date-picker" aria-describedby="shoot-help" aria-haspopup="dialog">انتخاب روز آفیش</button></label><label for="shoot-slot">بازه زمانی آفیش<select id="shoot-slot" required data-booking><option value="">انتخاب کن</option><option value="morning">صبح · ۱۰ تا ۱۴</option><option value="afternoon">عصر · ۱۶ تا ۲۰</option></select></label></div><p class="booking-note" id="shoot-help">تیم، زمان نهایی آفیش رو باهات هماهنگ می‌کنه.</p></div><div class="booking-stage" data-booking-stage hidden><div class="booking-grid"><label for="payment-model">مدل پرداخت<select id="payment-model" required data-booking><option value="">انتخاب کن</option><option value="full" selected>پرداخت کامل</option><option value="split">۵۰ درصد پیش پرداخت</option></select></label><label for="first-payment">تاریخ پرداخت <span id="first-payment-label">اول</span><input id="first-payment" type="hidden" data-booking><button type="button" class="date-picker" id="first-payment-picker" aria-haspopup="dialog">انتخاب تاریخ پرداخت</button><small id="first-payment-amount"></small></label><label id="second-payment-wrap" for="second-payment" hidden>تاریخ پرداخت دوم (۵۰٪)<input id="second-payment" type="hidden" data-booking><button type="button" class="date-picker" id="second-payment-picker" aria-haspopup="dialog">انتخاب تاریخ پرداخت دوم</button><small id="second-payment-amount"></small><small style="display:block">حداکثر تا قبل از برگزاری ضبط دوم</small></label></div><p class="booking-note">برای قطعی‌شدن رزرو آفیشت، فقط کافیه پرداخت کامل یا قسط اولت رو تا دو روز قبل از آفیش انجام بدی.</p><p id="booking-preview" class="review-text" aria-live="polite"></p></div><p id="booking-error" class="booking-error" role="alert" hidden></p></form></div></section>
${prompts.slice(3).map((item,i)=>promptPanel(item,bookingStepIndex+i+1)).join('')}
<section class="sheet step" data-panel="${agendaStep}" hidden tabindex="-1" aria-labelledby="agenda-title"><div class="sheet-intro"><div class="eyebrow">برنامه جلسه</div><div class="setup-heading">${stepIcon("agenda")}<h1 id="agenda-title">به‌زودی با هم جلسه می‌ذاریم.</h1></div><p class="lead">توی جلسه این ۴ تا کار رو با هم می‌کنیم.</p></div><ol class="agenda">${agenda.map((item,i)=>`<li><span class="number" aria-hidden="true">${new Intl.NumberFormat('fa-IR').format(i+1)}</span><div><h3>${item.title}</h3><p>${item.text}</p></div></li>`).join('')}</ol></section>
<section class="sheet step" data-panel="${total-1}" hidden tabindex="-1" aria-labelledby="review-title"><div class="summary-heading"><div class="eyebrow">یه نگاه آخر</div><div class="setup-heading">${stepIcon("review")}<h2 id="review-title">حرف‌هات اینجا جمعه.</h2></div><p id="ready-count" aria-live="polite">۰ از ۵ مورد آماده‌ست.</p></div><div class="summary"><article class="review"><div class="review-top"><h3>طرح، آفیش و پرداخت</h3><button class="edit" type="button" data-step="${bookingStepIndex}">ویرایش ←</button></div><p class="review-text" id="booking-review"></p></article>${prompts.map((item,i)=>`<article class="review"><div class="review-top"><h3>${item.title}</h3><button class="edit" type="button" data-step="${i<3?i+1:bookingStepIndex+i-2}">ویرایش ←</button></div><span class="review-status" data-review-status="${item.id}"></span><p class="review-text" data-review="${item.id}"></p></article>`).join('')}<p class="closing">سر جلسه همین صفحه رو باز کن؛ از روی یادداشت‌هات با هم حرف می‌زنیم.</p></div></section><div class="footnav"><button class="button" id="previous" type="button" disabled>→ قبلی</button><button class="button primary" id="next" type="button">بریم سراغ چک‌لیست آمادگی ←</button></div><div id="meeting-submission" hidden><div class="cloud-save"><button class="button primary" type="button" id="save-server" disabled>ثبت نهایی جلسه</button><button class="button" type="button" id="new-session" hidden>جلسه بعدی +</button><p class="save-note" id="cloud-status" role="status">در حال دریافت پاسخ‌های حسابت…</p></div><p class="save-note" id="save-note">هر فرم فقط یک‌بار ثبت می‌شه؛ بعدش توی جلسه‌های قبلی خودت و پنل تیم می‌مونه. برای جلسه بعد یه فرم تازه بساز. پیش‌نویس‌ها فقط توی همین مرورگر می‌مونن.</p></div></main><footer class="footer"><span>حرف بزنیم، بهتر جلو بریم.</span><span>STUDIO ROMAVA</span></footer></div><dialog class="plans-sheet" id="plans-sheet" aria-labelledby="plans-sheet-title">
  <div class="plans-sheet-bar"><strong id="plans-sheet-title">جزئیات و قیمت طرح‌ها</strong><button id="close-plans" type="button" aria-label="بستن طرح‌ها" autofocus>×</button></div>
  <iframe id="plans-frame" title="جزئیات و قیمت طرح‌ها"></iframe>
</dialog><dialog class="plans-sheet" id="reports-sheet" aria-labelledby="reports-sheet-title"><div class="plans-sheet-bar"><strong id="reports-sheet-title">گزارش‌ها</strong><button type="button" id="close-reports" aria-label="بستن گزارش‌ها" autofocus>×</button></div><iframe id="reports-frame" title="گزارش‌ها"></iframe></dialog><dialog class="calendar" id="jalali-calendar" aria-labelledby="calendar-title"><div class="calendar-top"><button type="button" id="calendar-prev" aria-label="ماه قبل">→</button><strong id="calendar-title"></strong><button type="button" id="calendar-next" aria-label="ماه بعد">←</button></div><p class="calendar-help" id="calendar-help"></p><div class="calendar-grid" id="calendar-grid"></div><button type="button" class="calendar-close" id="calendar-close">بستن تقویم</button></dialog><script>

const plansTrigger = document.getElementById('open-plans');
const plansSheet = document.getElementById('plans-sheet');
const plansFrame = document.getElementById('plans-frame');
plansTrigger.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (typeof plansSheet.showModal !== 'function') return;
  event.preventDefault();
  if (!plansFrame.hasAttribute('src')) plansFrame.src = '/r/plans?sheet=1';
  plansSheet.showModal();
});
document.getElementById('close-plans').addEventListener('click', () => plansSheet.close());
plansSheet.addEventListener('close', () => plansTrigger.focus({ preventScroll: true }));
plansFrame.addEventListener('load', () => {
  plansFrame.contentDocument?.addEventListener('keydown', event => {
    if (event.key === 'Escape' && plansSheet.open) plansSheet.close();
  });
});

const reportsTrigger = document.getElementById('open-reports');
const reportsSheet = document.getElementById('reports-sheet');
const reportsFrame = document.getElementById('reports-frame');
reportsTrigger.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof reportsSheet.showModal !== 'function') return;
  event.preventDefault();
  if (!reportsFrame.hasAttribute('src')) reportsFrame.src = reportsTrigger.href + '&sheet=1';
  reportsSheet.showModal();
});
document.getElementById('close-reports').addEventListener('click', () => reportsSheet.close());
reportsSheet.addEventListener('close', () => reportsTrigger.focus({ preventScroll: true }));
reportsFrame.addEventListener('load', () => {
  reportsFrame.contentDocument?.addEventListener('keydown', event => {
    if (event.key === 'Escape' && reportsSheet.open) reportsSheet.close();
  });
});

const reportMonth=${reportMonth};
const currentMeetingTitle='${meetingTitle}';
const planNames=${JSON.stringify(Object.fromEntries(meetingPlans.map(p=>[p.id,p.name])))};
const planPrices=${JSON.stringify(Object.fromEntries(meetingPlans.map(p=>[p.id,{1:renewalPrice(p,1),3:renewalPrice(p,3)}])))};
let archivedAmounts=null;
const cycle='${cycle}';
const oldKey='romava-meeting-v1-${storageId}';
const previousStorageKey=oldKey+':sessions';
const storageKey=previousStorageKey+':month-'+reportMonth;
let sessionId=crypto.randomUUID(),submitted=false,dirty=false,remoteReady=false,sessions=[];
const cloudStatus=document.getElementById('cloud-status'),saveServer=document.getElementById('save-server'),newSession=document.getElementById('new-session');
const panels=Array.from(document.querySelectorAll('[data-panel]')),dots=Array.from(document.querySelectorAll('.step-dot')),notes=Array.from(document.querySelectorAll('[data-note]')),checks=Array.from(document.querySelectorAll('[data-ready]'));
const futureStep=${futureStep},bookingStepIndex=${bookingStepIndex},agendaStep=${agendaStep};
const phases=document.querySelector(".phases");
let step=0;
let bookingStep=0;
let resetPreviousPosition=false;
const bookingStages=Array.from(document.querySelectorAll('[data-booking-stage]'));
const bookingIcons=Array.from(document.querySelectorAll('[data-booking-icon]'));
const bookingTitles=['طرح تمدیدت رو انتخاب کن','چه روزی برای آفیش مناسبه؟','چطور پرداخت می‌کنی؟'];
const bookingFields=Array.from(document.querySelectorAll('[data-booking]'));
const previous=document.getElementById('previous'),next=document.getElementById('next');
function today(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());return ['year','month','day'].map(k=>p.find(x=>x.type===k).value).join('-');}
function plusDays(day,n){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function field(id){return document.getElementById(id);}
function paymentAmounts(){const plan=document.querySelector('input[name="plan"]:checked')?.value,total=archivedAmounts?.totalPrice??planPrices[plan]?.[field('renewal-months').value]??0,split=field('payment-model').value==='split';return {totalPrice:total,firstPaymentAmount:archivedAmounts?.firstPaymentAmount??(split?Math.ceil(total/2):total),secondPaymentAmount:split?(archivedAmounts?.secondPaymentAmount??Math.floor(total/2)):null};}
function money(value){return new Intl.NumberFormat('fa-IR').format(value)+' تومان';}
function readBooking(){const first=field('first-payment').value,model=field('payment-model').value;return {...paymentAmounts(),renewalMonths:Number(field('renewal-months').value),plan:document.querySelector('input[name="plan"]:checked')?.value||'',shootDate:field('shoot-date').value,shootSlot:field('shoot-slot').value,paymentModel:model,firstPaymentDate:first,secondPaymentDate:model==='split'?(field('second-payment').value||null):null};}
function restoreBooking(b){document.querySelectorAll('input[name="plan"]').forEach(input=>input.checked=input.value===b?.plan);[['renewal-months','renewalMonths'],['shoot-date','shootDate'],['shoot-slot','shootSlot'],['payment-model','paymentModel'],['first-payment','firstPaymentDate'],['second-payment','secondPaymentDate']].forEach(([id,key])=>field(id).value=b?.[key]||(key==='paymentModel'?'full':key==='renewalMonths'?'1':''));}
function faDate(day){return day?new Intl.DateTimeFormat('fa-IR',{dateStyle:'long',timeZone:'Asia/Tehran'}).format(new Date(day+'T12:00:00Z')):'';}
function bookingSummary(showAmounts=true){const b=readBooking();return [b.plan?'طرح '+planNames[b.plan]+' · '+(b.renewalMonths===3?'سه‌ماهه':'ماهانه')+(showAmounts?' · '+money(b.totalPrice):''):'',b.shootDate?'آفیش پیشنهادی: '+faDate(b.shootDate)+(b.shootSlot?' · '+(b.shootSlot==='morning'?'۱۰ تا ۱۴':'۱۶ تا ۲۰'):''):'',b.firstPaymentDate?(b.paymentModel==='split'?'قسط اول (۵۰٪): ':'پرداخت کامل: ')+faDate(b.firstPaymentDate)+(b.plan&&showAmounts?' · '+money(b.firstPaymentAmount):''):'',b.secondPaymentDate?'قسط دوم (۵۰٪): '+faDate(b.secondPaymentDate)+(b.plan&&showAmounts?' · '+money(b.secondPaymentAmount):''):''].filter(Boolean).join('\\n');}
const shootLeadDays=${JSON.stringify(shootDateLeadDays)};
function updateBooking(){const b=readBooking(),day=today();field('shoot-date').min=plusDays(day,shootLeadDays.min);field('shoot-date').max=plusDays(day,shootLeadDays.max);field('first-payment').min=day;field('first-payment').max=b.shootDate?plusDays(b.shootDate,-2):'';field('quarterly-note').hidden=b.renewalMonths!==3;document.querySelector('.plan-options').classList.toggle('is-quarterly',b.renewalMonths===3);field('first-payment-label').textContent=b.paymentModel==='full'?'کامل':'اول (۵۰٪)';field('first-payment-amount').textContent=b.plan?money(b.firstPaymentAmount):'';field('second-payment-amount').textContent=b.plan?money(b.secondPaymentAmount||0):'';field('second-payment-wrap').hidden=b.paymentModel!=='split';field('second-payment-picker').disabled=submitted||!b.firstPaymentDate;field('second-payment-picker').textContent=b.secondPaymentDate?faDate(b.secondPaymentDate):'انتخاب تاریخ پرداخت دوم';field('booking-preview').textContent=bookingSummary(false);field('shoot-date-picker').textContent=b.shootDate?faDate(b.shootDate):'انتخاب روز آفیش';field('first-payment-picker').textContent=b.firstPaymentDate?faDate(b.firstPaymentDate):'انتخاب تاریخ پرداخت';}
function checkBooking(through=bookingStages.length-1){
  updateBooking();
  const b=readBooking(),day=today();
  const errors=[
    b.plan?'':'اول یه طرح انتخاب کن.',
    b.shootDate&&b.shootDate>=plusDays(day,shootLeadDays.min)&&b.shootDate<=plusDays(day,shootLeadDays.max)&&b.shootSlot?'':'روز آفیش و بازهٔ زمانی رو انتخاب کن. روز آفیش باید از دو روز تا ۱۴ روز بعد از امروز باشه.',
    b.shootDate&&b.paymentModel&&b.firstPaymentDate&&b.firstPaymentDate>=day&&b.firstPaymentDate<=plusDays(b.shootDate,-2)
      ? b.paymentModel!=='split'||(b.secondPaymentDate&&b.secondPaymentDate>b.firstPaymentDate&&b.secondPaymentDate<=plusDays(b.firstPaymentDate,14))
        ? '' : 'تاریخ پرداخت دوم رو از روز بعد از پرداخت اول تا حداکثر ۱۴ روز بعدش انتخاب کن.'
      : 'مدل و تاریخ پرداخت رو انتخاب کن. پرداخت اول باید تا دو روز قبل از آفیش باشه.'
  ];
  const invalid=errors.findIndex((error,index)=>index<=through&&error);
  if(invalid<0)return true;
  bookingStep=invalid;
  showStep(bookingStepIndex);
  field('booking-error').textContent=errors[invalid];
  field('booking-error').hidden=false;
  return false;
}
bookingFields.forEach(input=>input.addEventListener('change',()=>{updateBooking();field('booking-error').hidden=true;changed();}));
field('booking-form').addEventListener('submit',event=>event.preventDefault());
let calendarField='shoot-date',calendarMonth='';
function persianParts(iso){const parts=new Intl.DateTimeFormat('en-US-u-ca-persian',{year:'numeric',month:'numeric',day:'numeric',timeZone:'Asia/Tehran'}).formatToParts(new Date(iso+'T12:00:00Z'));return Object.fromEntries(parts.filter(p=>['year','month','day'].includes(p.type)).map(p=>[p.type,Number(p.value)]));}
function monthStart(iso){return plusDays(iso,1-persianParts(iso).day);}
function calendarLimits(){if(calendarField==='second-payment'){const first=field('first-payment').value||today();return {min:plusDays(first,1),max:plusDays(first,14)};}return calendarField==='shoot-date'?{min:plusDays(today(),shootLeadDays.min),max:plusDays(today(),shootLeadDays.max)}:{min:today(),max:field('shoot-date').value?plusDays(field('shoot-date').value,-2):''};}
function drawCalendar(){const grid=field('calendar-grid');grid.replaceChildren();const limits=calendarLimits(),selected=field(calendarField).value;field('calendar-title').textContent=new Intl.DateTimeFormat('fa-IR',{year:'numeric',month:'long',timeZone:'Asia/Tehran'}).format(new Date(calendarMonth+'T12:00:00Z'));field('calendar-help').textContent=calendarField==='shoot-date'?'از '+faDate(limits.min)+' تا '+faDate(limits.max)+' قابل انتخابه.':'پرداخت از '+faDate(limits.min)+(limits.max?' تا '+faDate(limits.max):'؛ اول روز آفیش رو انتخاب کن.');['ش','ی','د','س','چ','پ','ج'].forEach(day=>{const span=document.createElement('span');span.textContent=day;grid.append(span);});const offset=(new Date(calendarMonth+'T12:00:00Z').getUTCDay()+1)%7;for(let i=0;i<offset;i++)grid.append(document.createElement('i'));let day=calendarMonth;const month=persianParts(day).month;while(persianParts(day).month===month){const iso=day,button=document.createElement('button');button.type='button';button.textContent=new Intl.NumberFormat('fa-IR').format(persianParts(day).day);button.setAttribute('aria-label',faDate(day));button.setAttribute('aria-pressed',String(selected===day));button.disabled=day<limits.min||Boolean(limits.max&&day>limits.max)||(calendarField==='first-payment'&&!field('shoot-date').value);button.classList.toggle('today',day===today());button.addEventListener('click',()=>{field(calendarField).value=iso;field('jalali-calendar').close();updateBooking();changed();field(calendarField+'-picker').focus();});grid.append(button);day=plusDays(day,1);}field('calendar-prev').disabled=plusDays(calendarMonth,-1)<limits.min;field('calendar-next').disabled=Boolean(limits.max&&monthStart(plusDays(calendarMonth,32))>limits.max);}
function openCalendar(id){if(submitted)return;calendarField=id;const limits=calendarLimits();calendarMonth=monthStart(id==='second-payment'?limits.min:(field(id).value&&field(id).value>=limits.min&&(!limits.max||field(id).value<=limits.max)?field(id).value:limits.min));drawCalendar();field('jalali-calendar').showModal();if(id==='second-payment'){const firstAvailable=Array.from(field('calendar-grid').querySelectorAll('button')).find(button=>!button.disabled);if(firstAvailable)firstAvailable.focus();}}
field('shoot-date-picker').addEventListener('click',()=>openCalendar('shoot-date'));field('first-payment-picker').addEventListener('click',()=>openCalendar('first-payment'));field('second-payment-picker').addEventListener('click',()=>openCalendar('second-payment'));field('calendar-prev').addEventListener('click',()=>{calendarMonth=monthStart(plusDays(calendarMonth,-1));drawCalendar();});field('calendar-next').addEventListener('click',()=>{calendarMonth=monthStart(plusDays(calendarMonth,32));drawCalendar();});field('calendar-close').addEventListener('click',()=>field('jalali-calendar').close());
function storageUnavailable(){document.getElementById('save-note').textContent='ذخیره‌سازی مرورگرت در دسترس نیست؛ قبل از بستن صفحه، یادداشت‌هات رو یه جای دیگه نگه دار.';}
try{const ownDraft=localStorage.getItem(storageKey),legacyDraft=localStorage.getItem(oldKey+':migrated')?null:(localStorage.getItem(previousStorageKey)||localStorage.getItem(oldKey));const saved=JSON.parse(ownDraft||legacyDraft||'{}');if(!ownDraft&&legacyDraft){localStorage.setItem(oldKey+':migrated','yes');if(Number.isInteger(saved.step)&&saved.step>0)saved.step+=1;}if(saved&&typeof saved==='object'&&!Array.isArray(saved)){if(typeof saved.sessionId==='string'&&/^[a-f0-9-]{36}$/i.test(saved.sessionId))sessionId=saved.sessionId;submitted=saved.submitted===true;dirty=saved.dirty===true||(!submitted&&Object.values(saved.notes||{}).some(Boolean));notes.forEach(input=>{if(typeof saved.notes?.[input.dataset.note]==='string')input.value=saved.notes[input.dataset.note].slice(0,6000);});checks.forEach(input=>input.checked=saved.ready?.[input.dataset.ready]===true);restoreBooking(saved.booking);resetPreviousPosition=Boolean(ownDraft||legacyDraft)&&saved.stepOrder!==4;if(!resetPreviousPosition){if(Number.isInteger(saved.bookingStep)&&saved.bookingStep>=0&&saved.bookingStep<bookingStages.length)bookingStep=saved.bookingStep;if(Number.isInteger(saved.step)&&saved.step>=0&&saved.step<panels.length)step=saved.step;}}}catch{storageUnavailable();}
function save(){try{localStorage.setItem(storageKey,JSON.stringify({step,bookingStep,stepOrder:4,sessionId,submitted,dirty,reportMonth,booking:readBooking(),notes:Object.fromEntries(notes.map(input=>[input.dataset.note,input.value])),ready:Object.fromEntries(checks.map(input=>[input.dataset.ready,input.checked]))}));}catch{storageUnavailable();}}
function render(focus){
  bookingIcons.forEach((icon,index)=>icon.hidden=index!==bookingStep);
  bookingStages.forEach((stage,index)=>stage.hidden=index!==bookingStep);
  field('booking-title').textContent=bookingTitles[bookingStep];
  field('booking-stage-count').textContent=new Intl.NumberFormat('fa-IR').format(bookingStep+1)+' از '+new Intl.NumberFormat('fa-IR').format(bookingStages.length);
panels.forEach((panel,i)=>panel.hidden=i!==step);dots.forEach((dot,i)=>{dot.classList.toggle('visited',i<step);if(i===step)dot.setAttribute('aria-current','step');else dot.removeAttribute('aria-current');});document.getElementById('phase-agenda').setAttribute('aria-pressed',String(step>=agendaStep));document.getElementById('phase-preparation').setAttribute('aria-pressed',String(step<futureStep));document.getElementById('phase-booking').setAttribute('aria-pressed',String(step>=futureStep&&step<agendaStep));updateBooking();document.getElementById('booking-review').textContent=bookingSummary()||'برای این جلسه، طرح و زمان آفیش ثبت نشده.';previous.disabled=step===0;const reviewing=step===panels.length-1;next.hidden=reviewing;field('meeting-submission').hidden=!reviewing;next.textContent=step===0?'بریم سراغ ماه قبل ←':step===futureStep-1?'بریم سراغ ماه بعد ←':step===bookingStepIndex&&bookingStep===bookingStages.length-1?'بریم سراغ خبرهای ماه بعد ←':step===agendaStep-1?'برنامه جلسه رو ببین ←':step===agendaStep?'مرور و ثبت ←':'ادامه ←';document.getElementById('step-count').textContent=new Intl.NumberFormat('fa-IR').format(step+1)+' از '+new Intl.NumberFormat('fa-IR').format(panels.length);notes.forEach(input=>document.querySelector('[data-review="'+input.dataset.note+'"]').textContent=input.value.trim()||'برای این سؤال جوابی ثبت نشده.');checks.forEach(input=>{const el=document.querySelector('[data-review-status="'+input.dataset.ready+'"]');el.textContent=input.checked?'آماده‌ست ✓':'هنوز تیک نخورده';el.classList.toggle('done',input.checked);});document.getElementById('ready-count').textContent=new Intl.NumberFormat('fa-IR').format(checks.filter(input=>input.checked).length)+' از ۵ مورد آماده‌ست.';if (focus) {
  const panel = panels[step];
  panel.focus({ preventScroll: true });
  panel.style.scrollMarginTop = 'calc(' + (phases.offsetHeight + 16) + 'px + env(safe-area-inset-top, 0px))';
  panel.scrollIntoView({ block: 'start', behavior: 'instant' });
}}
function checkRequiredSteps(target){
  if(submitted)return true;
  for(const [index,panel] of panels.entries()){
    if(index>=target)break;
    if(index===bookingStepIndex&&!checkBooking())return false;
    const note=panel.querySelector('[data-note]');
    if(!note)continue;
    const check=panel.querySelector('[data-ready]');
    const hasAnswer=Boolean(note.value.trim());
    if(hasAnswer&&check.checked)continue;
    showStep(index);
    const error=field('error-'+note.dataset.note);
    error.textContent=hasAnswer?'تیک آمادگی رو بزن تا بریم مرحله بعد.':'جوابت رو بنویس. اگه موردی نداری، می‌تونی همون رو بنویسی.';
    error.hidden=false;
    (hasAnswer?check:note).focus({preventScroll:true});
    return false;
  }
  return true;
}
function go(value){
  if(value>step&&!checkRequiredSteps(value))return;
  showStep(value);
}
function showStep(value){field('booking-error').hidden=true;step=Math.max(0,Math.min(panels.length-1,value));render(true);save();}
previous.addEventListener('click',()=>{
  if(step===bookingStepIndex&&bookingStep>0){bookingStep--;go(bookingStepIndex);return;}
  go(step-1);
});
next.addEventListener('click',()=>{
  if(step===bookingStepIndex){
    if(!submitted&&!checkBooking(bookingStep))return;
    if(bookingStep<bookingStages.length-1){bookingStep++;go(bookingStepIndex);return;}
  }
  go(step+1);
});document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>go(Number(button.dataset.step))));[...notes,...checks].forEach(input=>input.addEventListener(input.matches('textarea')?'input':'change',()=>{
  field('error-'+(input.dataset.note||input.dataset.ready)).hidden=true;
  changed();
}));
if(submitted||checkRequiredSteps(step))render(false);
loadRemote();
function changed(){if(submitted)return;dirty=true;save();if(remoteReady)cloudStatus.textContent='پیش‌نویس آماده‌ست؛ آخر کار جلسه رو ثبت کن.';}
function payload(){const booking=readBooking();return {sessionId,reportMonth,booking,quotedTotal:booking.totalPrice,notes:Object.fromEntries(notes.map(input=>[input.dataset.note,input.value])),ready:Object.fromEntries(checks.map(input=>[input.dataset.ready,input.checked]))};}
function lock(value){submitted=value;bookingFields.forEach(input=>input.disabled=value);field('shoot-date-picker').disabled=value;field('first-payment-picker').disabled=value;field('second-payment-picker').disabled=value||!field('first-payment').value;notes.forEach(input=>input.readOnly=value);checks.forEach(input=>input.disabled=value);saveServer.hidden=value;newSession.hidden=!value;}
function showSession(data){if(dirty&&!submitted&&!confirm('پیش‌نویس فعلی کنار گذاشته می‌شه. جلسه قبلی رو باز کنیم؟'))return;archivedAmounts=data.booking||null;restoreBooking(data.booking);document.getElementById('meeting-context').textContent=data.meetingTitle||'جلسه ثبت‌شده';notes.forEach(input=>input.value=data.notes?.[input.dataset.note]||'');checks.forEach(input=>input.checked=data.ready?.[input.dataset.ready]===true);sessionId=data.sessionId||data.cycle;dirty=false;lock(true);step=panels.length-1;save();render(true);cloudStatus.textContent='این جلسه ثبت شده و توی آرشیو خودت و تیمه. برای جلسه بعد فرم تازه بساز.';return true;}
function renderHistory(){const list=document.getElementById('history-list');list.replaceChildren();document.getElementById('history-count').textContent='('+new Intl.NumberFormat('fa-IR').format(sessions.length)+')';if(!sessions.length){const p=document.createElement('p');p.textContent='هنوز جلسه‌ای ثبت نکردی.';list.append(p);return;}sessions.forEach((data,i)=>{const button=document.createElement('button');button.type='button';button.className='history-item';button.textContent=(data.meetingTitle||'جلسه')+' · '+new Intl.NumberFormat('fa-IR').format(sessions.length-i)+' · '+new Intl.DateTimeFormat('fa-IR',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Tehran'}).format(new Date(data.updatedAt))+' ←';button.addEventListener('click',()=>{if(showSession(data))document.getElementById("client-drawer")?.hidePopover?.();});list.append(button);});}
async function loadRemote(){try{const response=await fetch('/r/meeting/data',{credentials:'same-origin',cache:'no-store'});if(!response.ok)throw Error();const data=await response.json();sessions=data.sessions;remoteReady=true;renderHistory();const existing=sessions.find(row=>row.sessionId===sessionId);if(existing){dirty=false;if(resetPreviousPosition){newSession.click();}else{showSession(existing);}}else{if(submitted){lock(false);submitted=false;}saveServer.disabled=false;saveServer.textContent='ثبت نهایی جلسه';cloudStatus.textContent='پیش‌نویست اینجاست؛ آخر کار یک‌بار ثبتش کن.';}resetPreviousPosition=false;}catch{cloudStatus.textContent='اتصال برقرار نشد؛ پیش‌نویست توی این مرورگر می‌مونه. دوباره تلاش کن.';saveServer.disabled=false;saveServer.textContent='تلاش دوباره برای اتصال';document.getElementById('history-list').textContent='دریافت جلسه‌های قبلی ممکن نشد.';}}
saveServer.addEventListener('click',async()=>{if(submitted||step!==panels.length-1)return;if(!remoteReady){await loadRemote();if(!remoteReady)return;}if(!checkRequiredSteps(panels.length-1))return;if(!confirm('این جلسه یک‌بار ثبت می‌شه و تیم روماوا هم جواب‌ها رو می‌بینه. ثبت کنیم؟'))return;saveServer.disabled=true;cloudStatus.textContent='در حال ثبت جلسه…';const data=payload();bookingFields.forEach(input=>input.disabled=true);notes.forEach(input=>input.readOnly=true);checks.forEach(input=>input.disabled=true);try{const response=await fetch('/r/meeting/data',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':'${csrf}'},body:JSON.stringify(data)});if(response.status===412){cloudStatus.textContent='قیمت طرح تغییر کرده. صفحه رو تازه کن تا مبلغ جدید رو ببینی و دوباره ثبت کنی.';lock(false);return;}if(response.status===422){cloudStatus.textContent='گزارش جدیدی اضافه شده؛ صفحه رو تازه کن تا تمدید برای ماه درست انجام بشه.';lock(false);return;}if(response.status===409){await loadRemote();return;}if(!response.ok)throw Error();dirty=false;lock(true);save();await loadRemote();cloudStatus.textContent='جلسه ثبت شد؛ توی جلسه‌های قبلی خودت و پنل تیم می‌مونه.';}catch{cloudStatus.textContent='ثبت انجام نشد؛ پیش‌نویست اینجا مونده. دوباره تلاش کن.';lock(false);}finally{saveServer.disabled=false;}});
newSession.addEventListener('click',()=>{sessionId=crypto.randomUUID();archivedAmounts=null;restoreBooking();document.getElementById('meeting-context').textContent=currentMeetingTitle;notes.forEach(input=>input.value='');checks.forEach(input=>input.checked=false);dirty=false;lock(false);step=0;bookingStep=0;save();render(true);cloudStatus.textContent='فرم تازه برای جلسه بعد آماده‌ست.';});
lock(submitted);

</script></body></html>`;
}
