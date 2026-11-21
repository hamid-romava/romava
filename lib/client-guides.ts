import { clientNavigation } from "./dashboard-navigation";
import { authenticated, htmlHeaders, reports } from "./report-auth";

const guides = {
  recognition: {
    heading: "بهتره توی همکاری با ما بدونی",
    intro: "هر رابطه‌ای به شناخت دوطرفه نیاز داره. ما هم هرچی بیشتر همدیگه رو بشناسیم، راحت‌تر با هم کار می‌کنیم. برای اینکه با مدل کار و اخلاقمون آشنا بشی، این چندتا رو دربارهٔ ضبط بدون.",
    section: "بهتره بدونی‌های ضبط",
    items: [
      {
        title: "خودی بگه بهتره!",
        text: "ممکنه سر ضبط یه چیزی بگی و ما همون لحظه بگیم «خب، برام مهم نیست» یا حتی «چه مسخره!». اون لحظه داریم از چشم سخت‌گیرترین مخاطبت نگاه می‌کنیم. ترجیح می‌دیم قبل از انتشار، همون‌جا بگیم کجای حرف به دل مخاطب نمی‌شینه تا با هم درستش کنیم. خودی بگه بهتره!",
      },
      {
        title: "اگه به لباست گیر دادیم…",
        text: "ممکنه به لباس یا ظاهرت گیر بدیم. حواسمون به چیزیه که توی قاب دیده می‌شه و می‌خوایم قبل از انتشار فرصت داشته باشیم درستش کنیم. اینجا هم خودی بگه بهتره!",
      },
      {
        title: "یه شوخی تا یخ ضبط آب شه",
        text: "گاهی سر ضبط یه شوخی می‌کنیم که یخ جمع آب شه. حواسمون هست شوخی توی چارچوب و به‌قاعده باشه. اگه هم چیزی به دلت ننشست، همون‌جا بهمون بگو.",
      },
    ],
  },
  collaboration: {
    heading: "توی همکاری این چندتا کار با توئه",
    intro: "این‌ها کارهاییه که توی طول همکاری کمک می‌کنه پیج رو حرفه‌ای‌تر جلو ببریم.",
    section: "",
    items: [
      {
        title: "حواست به کلید هست؟",
        text: "مسئولیت امنیت پیج با خودته، ولی پیج تو برای ما هم مهمه. حواست باشه بیشتر از سه دستگاه رمز پیجت رو نداشته باشن. پیشنهاد ما دو تاست. برای فیلترشکن هم با اکانت منیجرت هماهنگ کن که تنظیماتمون یکی باشه.",
      },
      {
        title: "رعایت‌نامه انتشار محتوا",
        text: "بذار تعامل به‌طور طبیعی توی خود اینستاگرام اتفاق بیفته تا ببینیم مخاطب هدف چطور به محتوا واکنش نشون می‌ده.",
        rules: [
          "محتوا رو نه توی پیج خودت و نه توی پیج اطرافیان اد استوری نکن.",
          "از دوست‌ها و اطرافیان نخواه که برای بالا بردن تعامل، پست رو لایک کنن یا پشت‌سرهم کامنت بذارن.",
          "لینک محتوا رو توی گروه‌های تلگرام یا پلتفرم‌های دیگه به اشتراک نذار.",
        ],
      },
    ],
  },
} as const;

export function clientGuide(request: Request) {
  let report;
  try { report = Object.values(reports()).find(item => authenticated(request, item)); }
  catch { return new Response("Reports unavailable", { status: 503, headers: htmlHeaders }); }
  if (!report) return new Response(null, { status: 303, headers: { ...htmlHeaders, Location: "/admin" } });
  const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>شناخت و اصول همکاری | روماوا</title><style>
    @font-face{font-family:Yekan;src:url('/fonts/YekanBakh-Regular.ttf');font-display:swap}
    @font-face{font-family:Yekan;src:url('/fonts/YekanBakh-Bold.ttf');font-weight:700;font-display:swap}
    *{box-sizing:border-box}body{margin:0;background:#f5f6f8;color:#26324a;font:16px/1.9 Yekan,sans-serif}
    .page{max-width:800px;margin:auto;padding:18px 18px 124px}.guide{padding-top:24px}.guide>section+section{margin-top:28px}
    .guide-intro,.guide-card{padding:clamp(18px,5vw,30px);border:1px solid #dce3ef;border-radius:20px;background:#fff}
    .guide-intro{background:linear-gradient(120deg,#edf2ff,#fff 80%)}
    .guide-intro h2{margin:0;font-size:clamp(24px,5vw,34px);line-height:1.4}.guide-section,.guide-card h3,.guide-card h4{font-size:19px;line-height:1.55}
    .guide p{color:#526078;margin:8px 0 0}.guide-section{margin:22px 0 10px}
    .guide-list{display:grid;gap:12px;margin:16px 0 0;padding:0;list-style:none}.guide-card h3,.guide-card h4{margin:0}
    .guide-rules{margin:12px 0 0;padding-inline-start:22px;color:#526078}.guide-rules li+li{margin-top:6px}
  </style></head><body><div class="page"><header class="topbar"></header><main class="guide">
    ${Object.entries(guides).map(([key, guide]) => `<section aria-labelledby="${key}-title">
    <div class="guide-intro"><h2 id="${key}-title">${guide.heading}</h2><p>${guide.intro}</p></div>
    ${guide.section ? `<h3 class="guide-section">${guide.section}</h3>` : ""}
    <ul class="guide-list">${guide.items.map(item => {
      const tag = guide.section ? "h4" : "h3";
      const rules = "rules" in item ? `<ul class="guide-rules">${item.rules.map(rule => `<li>${rule}</li>`).join("")}</ul>` : "";
      return `<li class="guide-card"><${tag}>${item.title}</${tag}><p>${item.text}</p>${rules}</li>`;
    }).join("")}</ul></section>`).join("")}
  </main></div></body></html>`;
  return new Response(clientNavigation(html, report.token, "/r/collaboration"), { headers: htmlHeaders });
}
