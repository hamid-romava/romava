type Stats = Record<string, unknown>;

type Month = { id?: string; label: string; stats: Stats };

const fa = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const nonnegative = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

function chart(title: string, unit: string, labels: string[], values: (number | null)[], color: string) {
  const peak = Math.max(1, ...values.map(value => value ?? 0));
  const spacing = 92;
  const width = spacing * values.length;
  const points = values.map((value, index) => value === null ? null : {
    x: spacing * (index + 0.5),
    y: 110 - 94 * (value / peak),
  });
  const path = points.map((point, index) =>
    point ? `${points[index - 1] ? "L" : "M"}${point.x},${point.y}` : "",
  ).join(" ");
  return `<figure class="trend-card">
    <figcaption><h3>${title}</h3><p>${unit}</p></figcaption>
    <div class="trend-scroll" dir="ltr" tabindex="0" aria-label="${title}">
      <div class="trend-plot" style="min-width:${width}px">
        <svg viewBox="0 0 ${width} 122" aria-hidden="true" style="color:${color}">
          <path d="M0 110H${width} M0 63H${width} M0 16H${width}" stroke="#e6eaf2" fill="none"/>
          <path d="${path}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          ${points.map(point => point ? `<circle cx="${point.x}" cy="${point.y}" r="4" fill="white" stroke="currentColor" stroke-width="2"/>` : "").join("")}
        </svg>
        <ol>${labels.map((label, index) => `<li dir="rtl"><strong>${values[index] === null ? "—" : fa.format(values[index])}</strong><span>${label}</span></li>`).join("")}</ol>
      </div>
    </div>
  </figure>`;
}

export function reportTrends(months: Month[]) {
  if (months.length < 2) return "";
  const first = months[0].stats;
  const labels = ["قبل از روماوا", ...months.map(month => month.label)];
  const views = [nonnegative(first.beforeViewsK) ? first.beforeViewsK * 1000 : null,
    ...months.map(({ stats }) => nonnegative(stats.viewGainK) && nonnegative(stats.postCount) && stats.postCount > 0
      ? stats.viewGainK * 1000 / stats.postCount : null)];
  const followers = [nonnegative(first.beforeFollowers) ? first.beforeFollowers : null,
    ...months.map(({ stats }) => nonnegative(stats.followerGain) ? stats.followerGain : null)];
  return `<section class="report-trends" aria-labelledby="trend-title">
    <h2 id="trend-title">روند همکاری</h2>
    <div class="trend-grid">
      ${chart("بازدید محتوا", "میانگین بازدید هر پست", labels, views, "#2855f5")}
      ${chart("فالوور جدید", "تعداد فالوور جدید در هر ماه", labels, followers, "#167658")}
    </div>
  </section>`;
}

const overviewCss = `
@font-face{font-family:Yekan;src:url('/fonts/YekanBakh-Regular.ttf')}
@font-face{font-family:Yekan;src:url('/fonts/YekanBakh-Bold.ttf');font-weight:700}
*{box-sizing:border-box}body{margin:0;background:#f7f8fa;color:#20242d;font:14px/1.8 Yekan,Arial,sans-serif}
.page{width:min(calc(100% - 32px),1100px);margin:auto}.topbar{padding:16px 0;border-bottom:1px solid #e0e5ee}main{padding:24px 0}
.overview-heading{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
.overview-heading h1,.month-setup h1{margin:0;font-size:clamp(22px,4.8vw,28px)}
.overview-heading p,.month-setup p{margin:4px 0 0;color:#64748b}
.overview-totals{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:26px}
.overview-total{padding:clamp(16px,4vw,24px);background:#fff;border:1px solid #e0e5ee;border-radius:16px}

.overview-total>span:first-child{color:#777e8b;font-weight:700}
.overview-total .metric-icon{float:left;display:grid;place-items:center;width:34px;height:34px;margin-top:-3px;border-radius:11px;background:#eef2ff;color:#6b80c9}
.overview-total .metric-icon svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.overview-total strong{display:block;clear:both;margin-top:16px;font-size:clamp(20px,5vw,32px);overflow-wrap:anywhere}
.report-action{display:inline-block;border:0;border-radius:12px;padding:10px 16px;background:#2855f5;color:#fff;text-decoration:none;font:inherit;font-weight:700;cursor:pointer}
.month-setup{max-width:430px;margin:clamp(12px,9vh,70px) auto;padding:clamp(18px,5vw,30px);background:#fff;border:1px solid #e0e5ee;border-radius:22px}
.month-options{display:grid;gap:8px;margin:18px 0;padding:0;border:0}
.month-options label{display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid #e0e5ee;border-radius:12px;cursor:pointer}
.month-options label:has(:checked){background:#eef2ff;border-color:#94aaff}
.month-options input{accent-color:#2855f5}
.month-setup .report-action{width:100%}
.report-trends{margin:0 0 30px}.report-trends>h2{margin:0 0 14px;font-size:21px}
.trend-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.trend-card{min-width:0;margin:0;padding:18px;background:white;border:1px solid #e0e5ee;border-radius:18px}
.trend-card h3{margin:0;font-size:15px}.trend-card p{margin:3px 0 13px;color:#64748b;font-size:12px}
.trend-scroll{overflow-x:auto;scrollbar-width:thin}.trend-plot svg{display:block;width:100%;height:auto}
.trend-plot ol{list-style:none;margin:4px 0 0;padding:0;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr)}
.trend-plot li{display:grid;text-align:center;font-size:11px;color:#64748b}.trend-plot li strong{color:#20242d;font-size:13px}
@media(max-width:760px){.trend-grid{grid-template-columns:1fr}.trend-card{padding:14px}}
`;

export function reportOverview(months: Month[], chooseMonth: boolean) {
  const sum = (key: "viewGainK" | "followerGain", multiplier = 1) => {
    const values = months.map(({ stats }) => stats[key]).filter(nonnegative);
    return values.length ? fa.format(values.reduce((total, value) => total + value * multiplier, 0)) : "—";
  };
  const monthChooser = `<section class="month-setup">
    <h1>گزارش کدوم ماه رو می‌خوای؟</h1>
    <p>یه ماه انتخاب کن تا گزارشش رو ببینی.</p>
    <form method="get">
      <fieldset class="month-options" aria-label="ماه گزارش">
        ${months.map(({ label, id }, index) => `<label><input type="radio" name="month" value="${id}"${index === months.length - 1 ? " checked" : ""}> ${label}</label>`).join("")}
      </fieldset>
      <button class="report-action" type="submit">ادامه</button>
    </form>
  </section>`;
  const overview = `<div class="overview-heading">
    <div><h1>گزارش کلی عملکرد</h1><p>جمع نتایج ${fa.format(months.length)} ماه همکاری</p></div>
  </div>
  <div class="overview-totals">
    <div class="overview-total"><span>کل بازدید محتوا</span><span class="metric-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></span><strong>${sum("viewGainK", 1000)}</strong></div>
    <div class="overview-total"><span>کل فالوور جدید</span><span class="metric-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0112 0v2M19 6v6M16 9h6"/></svg></span><strong>${sum("followerGain")}</strong></div>
  </div>
  ${reportTrends(months)}`;
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>گزارش عملکرد | روماوا</title><style>${overviewCss}</style></head><body><div class="page"><header class="topbar"></header><main>${chooseMonth ? monthChooser : overview}</main></div></body></html>`;
}
