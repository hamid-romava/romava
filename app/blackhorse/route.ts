import { projectCalculator } from "../../lib/project-calculator";
import { dashboardOnboarding, requireOnboarding } from "../../lib/onboarding";
import { feedbackKinds, isFeedbackKind } from "../../lib/feedback-types";
import { getPricing, pricingFromForm, savePricing } from "../../lib/pricing-store";
import { pricedPlans } from "../../lib/pricing-plans";
import { dashboardLogo, teamNavigationLayout } from "../../lib/dashboard-navigation";
import type { MongoClient } from "mongodb";
import { bookingLines } from "@/lib/meeting-booking";
import { hash, htmlHeaders } from "@/lib/report-auth";
import { listMeetings } from "@/lib/meeting-store";
import { loginNonce, readCookie, teamConfigured, teamCookie, teamLoginKey, teamPasswordHash, teamRole, type TeamRole } from "@/lib/team-auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
const headers = { ...htmlHeaders, "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'" };
const labels: Record<string, string> = { liked: "چی به دلش نشست؟", improve: "کجا جای بهترشدن داره؟", results: "خبرهای پشت پیج", "next-month": "رویدادها و اتفاق‌های پیش رو", ideas: "ایده‌های پیشنهادی" };
function page(body: string, view = "", backToShoots = false) { return teamNavigationLayout( `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>پنل تیم روماوا</title><style>@font-face{font-family:Yekan;src:url('/fonts/YekanBakh-Regular.ttf')}*{box-sizing:border-box}body{font:14px/2 Yekan,sans-serif;background:#f7f8fa;color:#26324a;margin:0}.page{max-width:900px;margin:auto;padding:28px 20px}header{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid #e1e6f0;padding-bottom:20px}header img{width:100px}h1{font-size:26px;margin:30px 0 8px}p{color:#788397}button,input{font:inherit}button{cursor:pointer;background:#2855f5;color:white;border:0;border-radius:10px;padding:10px 20px}input{display:block;width:100%;border:1px solid #dce2ef;padding:12px;border-radius:10px;margin:8px 0 18px}.login{max-width:390px;margin:60px auto}.card{background:white;border:1px solid #e1e6ef;border-radius:16px;margin:16px 0;padding:20px}summary{cursor:pointer;font-weight:bold}small{color:#8792a5}.answer{padding:15px 0;border-bottom:1px solid #edf0f6}.answer:last-child{border:0}.answer h3{font-size:13px;margin:0}.answer p{white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0 0;color:#58677e}.notice{background:#fff3d6;border-radius:12px;padding:15px}.logout{background:white;color:#68738c;border:1px solid #dce2ef}label{display:block}.team-nav,.paging{display:flex;flex-wrap:wrap;gap:10px;margin:20px 0}.team-nav a,.paging a{padding:6px 14px;border:1px solid #dce2ef;border-radius:10px;color:#26324a;text-decoration:none;background:white}.team-nav a[aria-current]{background:#2855f5;color:white;border-color:#2855f5}.contact-meta{margin:10px 0 0}.contact-meta div{display:flex;gap:10px;flex-wrap:wrap}.contact-meta dt{color:#58677e}.contact-meta dd{margin:0;overflow-wrap:anywhere}.analytics-list{list-style:none;padding:0;margin:0}.analytics-list li{display:flex;justify-content:space-between;gap:16px;padding:10px 0}.analytics-list li+li{border-top:1px solid #e5e8f0}select{font:inherit;display:block;width:100%;background:white;color:inherit;border:1px solid #dce2ef;border-radius:10px;padding:12px;margin:8px 0 18px}.shoot-items{margin:12px 0 18px}.shoot-items label{display:flex;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #edf0f6;cursor:pointer}.shoot-items input{width:20px;height:20px;flex:none;margin:0;accent-color:#2855f5}
.team-brand{display:flex;align-items:center;gap:14px}
.team-menu-toggle,.team-menu-heading button{display:grid;place-content:center;width:44px;height:44px;padding:0;background:#fff;color:#26324a;border:1px solid #dce2ef;border-radius:10px}
.team-menu-toggle{gap:4px}
.team-menu-toggle span{width:18px;height:2px;border-radius:2px;background:currentColor}


.shoot-progress{margin:20px 0}.shoot-progress-label{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}.shoot-progress-label span{color:#58677e}
.shoot-progress progress{display:block;width:100%;height:8px;margin-top:8px;accent-color:#2855f5}
.shoot-stages{margin:12px 0}.shoot-stages a{display:inline-flex;gap:6px;align-items:center}.stage-locked{display:inline-flex;align-items:center;padding:10px 14px;border:1px solid #e1e6ef;border-radius:10px;background:#f1f3f7;color:#68738c}.shoot-stages .stage-add{border-style:dashed}
.shoot-stages .stage-complete:not([aria-current]){color:#176344;border-color:#a8d9c6;background:#edf9f3}.stage-mark{font-weight:bold}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.card textarea{display:block;width:100%;font:inherit;color:inherit;border:1px solid #dce2ef;border-radius:10px;padding:12px;margin:8px 0 18px;resize:vertical}</style></head><body><div class="page">${body}</div></body></html>`, view, backToShoots); }
function login(request: Request, error = "") {
  const nonce = loginNonce();
  return new Response(page(`<header><img src="${dashboardLogo}" alt="روماوا"><span>ورود تیم</span></header><form class="login" method="post"><h1>ورود به داشبورد تیم</h1>${error ? `<p role="alert">${escape(error)}</p>` : ""}<input type="hidden" name="csrf" value="${nonce}"><label>نام کاربری<input name="username" autocomplete="username" required></label><label>رمز عبور<input name="password" type="password" autocomplete="current-password" required></label><button>ورود به پنل تیم</button></form>`), { headers: { ...headers, "Set-Cookie": `romava_team_csrf=${nonce}; Path=/blackhorse; HttpOnly; SameSite=Strict; Max-Age=600${new URL(request.url).protocol === "https:" ? "; Secure" : ""}` } });
}
const analyticsTestCookie = "romava_ga_test";

async function teamNavigation(request: Request, active: "meetings" | "requests" | "analytics" | "qc" | "shoots" | "pricing" | "feedback" | "culture-addendum" | "project-shares") {
  return `<header>
    <div class="team-brand"${(await teamRole(request)) === "creator" ? ' data-team-role="creator"' : ""}>
      <button type="button" class="team-menu-toggle" popovertarget="team-menu" aria-label="منوی پنل تیم">
        <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
      </button>
    </div>
    <form method="post" action="/blackhorse">
      <input type="hidden" name="action" value="logout">
      <input type="hidden" name="csrf" value="${hash(readCookie(request, "romava_team_session") + ":logout")}">
      <button class="logout">خروج</button>
    </form>
  </header>
  <div id="team-menu" class="team-menu" popover>
    <div class="team-menu-heading">
      <img class="drawer-logo" src="${dashboardLogo}" alt="روماوا">
      <button type="button" popovertarget="team-menu" popovertargetaction="hide" aria-label="بستن منو">×</button>
    </div>
    <nav class="team-nav team-menu-links" aria-label="بخش‌های پنل تیم">
    <a href="/blackhorse"${active === "meetings" ? ' aria-current="page"' : ""}>پاسخ جلسات</a>
    <a href="/blackhorse?view=requests"${active === "requests" ? ' aria-current="page"' : ""}>درخواست‌های سایت</a>
    <a href="/blackhorse?view=analytics"${active === "analytics" ? ' aria-current="page"' : ""}>آمار سایت</a>
    <a href="/blackhorse?view=pricing"${active === "pricing" ? ' aria-current="page"' : ""}>قیمت طرح‌ها</a>
    <a href="/blackhorse?view=qc"${active === "qc" ? ' aria-current="page"' : ""}>QC سایت</a>
    <a href="/blackhorse?view=project-shares"${active === "project-shares" ? ' aria-current="page"' : ""}>ماشین‌حساب تقسیم درآمد</a>
    <a href="/blackhorse?view=culture-addendum"${active === "culture-addendum" ? ' aria-current="page"' : ""}>متمم فرهنگ‌نامه</a>
    <a href="/blackhorse?view=shoots"${active === "shoots" ? ' aria-current="page"' : ""}>چک‌لیست آفیش</a>
    <a href="/blackhorse?view=password">تغییر رمز</a>
    </nav>
  </div>`;
}

async function teamPricing(request: Request, status = 200, message = "") {
  const navigation = await teamNavigation(request, "pricing");
  try {
    const plans = pricedPlans(await getPricing());
    const csrf = hash(readCookie(request, "romava_team_session") + ":pricing");
    const fields = plans.map(plan => `<fieldset class="card"><legend>طرح ${plan.name}</legend>
      <label>قیمت ماهانه (تومان)<input name="${plan.id}-price" type="text" dir="ltr" inputmode="numeric" maxlength="13" required value="${plan.priceToman}"></label>
      <label>تخفیف تمدید سه‌ماهه (درصد)<input name="${plan.id}-discount" type="text" dir="ltr" inputmode="numeric" maxlength="3" required value="${plan.discount}"></label>
    </fieldset>`).join("");
    return new Response(page(`${navigation}<main><h1>قیمت طرح‌ها</h1>
      <p>قیمت‌ها رو به تومان و تخفیف‌ها رو به درصد بنویس. این عددها توی صفحهٔ طرح‌ها و فرم تمدید نمایش داده می‌شن.</p>
      ${message ? `<p class="notice" role="${status >= 400 ? "alert" : "status"}">${escape(message)}</p>` : ""}
      <form method="post" action="/blackhorse?view=pricing">
        <input type="hidden" name="action" value="save-pricing"><input type="hidden" name="csrf" value="${csrf}">
        ${fields}<button type="submit">ذخیرهٔ قیمت‌ها</button>
      </form></main>`, "pricing"), { status, headers });
  } catch {
    return new Response(page(navigation + '<p class="notice" role="alert">تنظیمات قیمت فعلاً در دسترس نیست. دوباره تلاش کن.</p>', "pricing"), { status: 503, headers });
  }
}

async function websiteQc(request: Request) {
  const testMode = readCookie(request, analyticsTestCookie) === "1";
  const testModeCsrf = hash(readCookie(request, "romava_team_session") + ":analytics-test");
  return new Response(page(`${await teamNavigation(request, "qc")}<h1>QC سایت</h1>
    <section class="card">
      <h2>حالت تست گوگل</h2>
      <p role="status">${testMode ? "حالت تست گوگل روی همین مرورگر فعاله." : "حالت تست گوگل روی همین مرورگر خاموشه."}</p>
      <p>برای اینکه بازدیدها و تست فرم وارد آمار گوگل نشن، قبل از باز کردن سایت حالت تست رو روشن کن.</p>
  <form class="team-nav" method="post" action="/blackhorse">
    <input type="hidden" name="action" value="analytics-test">
    <input type="hidden" name="csrf" value="${testModeCsrf}">
    <input type="hidden" name="enabled" value="${testMode ? "0" : "1"}">
    <button class="logout">${testMode ? "خاموش کردن حالت تست گوگل" : "روشن کردن حالت تست گوگل"}</button>
    ${testMode ? '<a href="/">باز کردن سایت برای تست ↗</a>' : ""}
  </form>
    </section>`), { headers });
}

function contactDate(value: unknown) {
  if (typeof value !== "string" && !(value instanceof Date)) return "تاریخ ثبت نامشخص";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "تاریخ ثبت نامشخص" : new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran",
  }).format(date);
}

async function websiteRequests(request: Request, url: URL) {
  const navigation = await teamNavigation(request, "requests");
  const pageSize = 30;
  const requestedPage = Number(url.searchParams.get("page"));
  const current = Number.isSafeInteger(requestedPage) && requestedPage > 0 && requestedPage <= Math.floor(Number.MAX_SAFE_INTEGER / pageSize) ? requestedPage : 1;
  try {
    const { default: clientPromise } = await import("@/lib/mongodb") as { default: Promise<MongoClient> | null };
    const client = await clientPromise;
    if (!client) throw new Error("Contact storage unavailable");
    const rows = await client.db("mydb").collection("contacts")
      .find({}, { projection: { name: 1, phone: 1, message: 1, instagram: 1, collaboration: 1, createdAt: 1 } })
      .sort({ createdAt: -1, _id: -1 }).skip((current - 1) * pageSize).limit(pageSize + 1).toArray();

    const cards = rows.slice(0, pageSize).map(row => `<details class="card">
      <summary>${escape(row.name) || "بدون نام"}<br><small>${escape(contactDate(row.createdAt))}</small></summary>
      <dl class="contact-meta">
        <div><dt>شماره تماس</dt><dd><bdi dir="ltr">${escape(row.phone) || "—"}</bdi></dd></div>
        ${row.instagram ? `<div><dt>اینستاگرام</dt><dd><bdi>${escape(row.instagram)}</bdi></dd></div>` : ""}
        ${row.collaboration ? `<div><dt>نوع همکاری</dt><dd>${escape(row.collaboration)}</dd></div>` : ""}
      </dl>
      <div class="answer"><h3>متن درخواست</h3><p>${escape(row.message) || "—"}</p></div>
    </details>`).join("");
    const previous = current > 1 ? `<a href="?view=requests&amp;page=${current - 1}">صفحه قبل</a>` : "";
    const next = rows.length > pageSize ? `<a href="?view=requests&amp;page=${current + 1}">صفحه بعد</a>` : "";
    const paging = previous || next ? `<nav class="paging" aria-label="صفحه‌های درخواست‌ها">${previous}${next}</nav>` : "";
    return new Response(page(`${navigation}<h1>درخواست‌های سایت</h1><p>درخواست‌های ثبت‌شده از جدیدترین به قدیمی‌ترین.</p>${cards || '<p class="card">درخواستی توی این صفحه نیست.</p>'}${paging}`), { headers });
  } catch {
    return new Response(page(`${navigation}<h1>درخواست‌های سایت</h1><p class="notice" role="alert">دریافت درخواست‌ها فعلاً ممکن نیست. دوباره تلاش کن.</p>`), { status: 503, headers });
  }
}

async function customerFeedback(request: Request, url: URL) {
  const title = "بازخورد مشتری‌ها";
  const navigation = await teamNavigation(request, "feedback");
  const heading = navigation.replace("</header>", () => `<h1>${title}</h1></header>`);
  const pageSize = 30;
  const requested = Number(url.searchParams.get("page"));
  const current = Number.isSafeInteger(requested) && requested > 0 && requested <= Math.floor(Number.MAX_SAFE_INTEGER / pageSize) ? requested : 1;
  try {
    const { default: connection } = await import("@/lib/mongodb") as { default: Promise<MongoClient> | null };
    if (!connection) throw new Error("Feedback storage unavailable");
    const rows = await (await connection).db("mydb").collection("client_feedback")
      .find({}, { projection: { clientName: 1, kind: 1, message: 1, createdAt: 1 } })
      .sort({ createdAt: -1, _id: -1 }).skip((current - 1) * pageSize).limit(pageSize + 1).toArray();
    const cards = rows.slice(0, pageSize).map(row => {
      const kind = isFeedbackKind(row.kind) ? feedbackKinds[row.kind] : "بازخورد";
      return `<article class="card"><h2>${kind} · ${escape(row.clientName) || "بدون نام"}</h2><small>${escape(contactDate(row.createdAt))}</small><div class="answer"><p>${escape(row.message) || "—"}</p></div></article>`;
    }).join("");
    const previous = current > 1 ? `<a href="?view=feedback&amp;page=${current - 1}">صفحه قبل</a>` : "";
    const next = rows.length > pageSize ? `<a href="?view=feedback&amp;page=${current + 1}">صفحه بعد</a>` : "";
    const paging = previous || next ? `<nav class="paging" aria-label="صفحه‌های بازخورد">${previous}${next}</nav>` : "";
    return new Response(page(heading + (cards || '<p class="card">بازخوردی توی این صفحه نیست.</p>') + paging, "feedback"), { headers });
  } catch {
    return new Response(page(heading + '<p class="notice" role="alert">دریافت بازخوردها فعلاً ممکن نیست. دوباره تلاش کن.</p>', "feedback"), { status: 503, headers });
  }
}

async function websiteAnalytics(request: Request, url: URL) {
  const navigation = await teamNavigation(request, "analytics");
  const days = url.searchParams.get("days") === "7" ? 7 : 30;
  const rangeLinks = ([7, 30] as const).map(range =>
    `<a href="?view=analytics&amp;days=${range}"${days === range ? ' aria-current="true"' : ""}>${range === 7 ? "۷" : "۳۰"} روز گذشته</a>`
  ).join("");
  const heading = `${navigation}<h1>آمار سایت</h1><nav class="team-nav" aria-label="بازه آمار">${rangeLinks}</nav>`;
  const number = new Intl.NumberFormat("fa-IR");
  const channelLabels = new Map([
    ["Direct", "مستقیم"], ["Organic Search", "جست‌وجوی طبیعی"], ["Organic Social", "شبکه‌های اجتماعی"],
    ["Referral", "لینک از سایت‌های دیگه"], ["Paid Search", "تبلیغات جست‌وجو"], ["Paid Social", "تبلیغات شبکه‌های اجتماعی"],
    ["Email", "ایمیل"], ["Unassigned", "کانال نامشخص"],
  ]);
  try {
    const { siteAnalytics } = await import("@/lib/site-analytics");
    const data = await siteAnalytics(days);
    if (!data) return new Response(page(heading + '<p class="notice">اتصال به گوگل آنالیتیکس هنوز فعال نشده.</p>'), { headers });
    const list = (rows: { label: string; count: number }[], labels?: Map<string, string>) => rows.map(
      ({ label, count }) => `<li>${escape(labels?.get(label) ?? label)} <strong>${number.format(count)}</strong></li>`
    ).join("");
    return new Response(page(`${heading}
      <section class="card"><h2>از بازدید تا ثبت درخواست</h2>
        <p>تعداد کاربران هر مرحله، جداگانه شمرده شده. آمار تا پایان دیروزه.</p>
        <ol class="analytics-list">${list(data.stages)}</ol>
      </section>
      <section class="card"><h2>از کجا اومدن؟</h2>
        <p>تعداد نشست‌هایی که صفحهٔ اصلی رو دیدن، به تفکیک کانال ورود.</p>
        ${data.channels.length ? `<ul class="analytics-list">${list(data.channels, channelLabels)}</ul>` : '<p>توی این بازه، ورودی‌ای ثبت نشده.</p>'}
      </section>`), { headers });
  } catch {
    return new Response(page(heading + '<p class="notice" role="alert">آمار گوگل فعلاً در دسترس نیست. دوباره تلاش کن.</p>'), { status: 503, headers });
  }
}

async function cultureAddendum(request: Request) {
  const navigation = (await teamNavigation(request, "culture-addendum")).replace("</header>", "<h1>متمم فرهنگ‌نامه</h1></header>");
  return new Response(page(`${navigation}
    <style>
      .culture-sheet{position:fixed;inset:auto 0 0;width:min(100%,920px);height:94dvh;max-width:none;max-height:none;margin:0 auto;padding:0;border:1px solid #dce3f0;border-radius:22px 22px 0 0;background:#fff;color:#26324a;overflow:hidden}
      .culture-sheet[open]{display:grid;grid-template-rows:auto minmax(0,1fr)}
      .culture-sheet::backdrop{background:#17203d66}
      .culture-sheet-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 16px;border-bottom:1px solid #e1e6ef}
      .culture-sheet-bar form{margin:0}.culture-sheet-bar button{font-size:24px}
      .culture-sheet iframe{width:100%;height:100%;border:0}
      html:has(.culture-sheet[open]){overflow:hidden}
      @media(prefers-reduced-motion:no-preference){.culture-sheet[open]{animation:culture-sheet-in .28s ease-out}@keyframes culture-sheet-in{from{transform:translateY(100%)}to{transform:translateY(0)}}}
    </style>
    <p><a href="/culture" id="open-culture" aria-haspopup="dialog">اول فرهنگ‌نامه رو توی سایت بخون ←</a></p>
    <dialog class="culture-sheet" id="culture-sheet" aria-labelledby="culture-sheet-title">
      <div class="culture-sheet-bar"><strong id="culture-sheet-title">فرهنگ‌نامه</strong><form method="dialog"><button class="app-button" type="submit" aria-label="بستن فرهنگ‌نامه" autofocus>×</button></form></div>
      <iframe id="culture-frame" title="فرهنگ‌نامه روماوا"></iframe>
    </dialog><script src="/team-culture-sheet.js" defer></script>
    <article class="card"><h2>رازدار زره‌پوش</h2>
    <p>یه سری چیزها رازهای بین خودمونه و واسشون زره می‌پوشیم. هر چیزی که توی سایت روماوا منتشر نشده بین خودمون می‌مونه. مثلاً قیمت طرح‌ها، مدل کار کردنمون و استراتژی‌های فصلی و ماهانه.</p></article>`, "culture-addendum"), { headers: { ...headers, "Content-Security-Policy": headers["Content-Security-Policy"] + "; frame-src 'self'" } });
}

export async function GET(request: Request) {
  if (!teamConfigured()) return new Response("Team access unavailable", { status: 503, headers });
  const url = new URL(request.url);
  const view = url.searchParams.get("view");
  const role = await teamRole(request).catch(() => undefined);
  if (role === undefined) return new Response("Team access unavailable", { status: 503, headers });
  if (role) {
    const destination = role === "creator" ? "/blackhorse?view=shoots" : "/blackhorse";
    if (view === "onboarding" || view === "password") return dashboardOnboarding(request, "team", "team:" + role, readCookie(request, "romava_team_session"), destination, teamPasswordHash(role)!, key => teamCookie(request, false, role, key));
    const setup = await requireOnboarding("team", "team:" + role);
    if (setup) return view === "notification-feed" && setup.status === 303 ? Response.json({ error: "onboarding_required" }, { status: 403, headers: { ...headers, "Content-Type": "application/json" } }) : setup;
  }
  if (view === "notification-feed") {
    const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { ...headers, "Content-Type": "application/json" } });
    if (role !== "manager") return json({ error: "unauthorized" }, role ? 403 : 401);
    try {
      const { teamNotifications } = await import("../../lib/team-notifications");
      return json({ items: await teamNotifications() });
    } catch {
      return json({ error: "storage_unavailable" }, 503);
    }
  }
  if (!role) return login(request);
  if (role === "creator") {
    if (!view) return new Response(null, { status: 303, headers: { ...headers, Location: "/blackhorse?view=shoots" } });
    if (view !== "shoots" && view !== "qc" && view !== "culture-addendum") {
      return new Response("Forbidden", { status: 403, headers });
    }
  }
  if (view === "project-shares") {
    const navigation = (await teamNavigation(request, view)).replace("</header>", "<h1>ماشین‌حساب تقسیم درآمد</h1></header>");
    try {
      const plans = pricedPlans(await getPricing());
      return new Response(page(navigation + projectCalculator(plans), view), { headers });
    } catch {
      return new Response(page(navigation + '<p class="notice" role="alert">قیمت طرح‌ها فعلاً در دسترس نیست. دوباره تلاش کن.</p>', view), { status: 503, headers });
    }
  }
  if (view === "culture-addendum") return cultureAddendum(request);
  if (url.searchParams.get("view") === "shoots") {
    const navigation = await teamNavigation(request, "shoots");
    try {
      const { renderShootChecklists } = await import("@/lib/shoot-checklists");
      const csrf = hash(readCookie(request, "romava_team_session") + ":shoot-checklists");
      const body = await renderShootChecklists(url, { escape, csrf, newId: loginNonce().slice(0, 24) });
      const heading = body.match(/<h1>([\s\S]*?)<\/h1>/);
      const header = heading ? navigation.replace("</header>", () => `<h1>${heading[1]}</h1></header>`) : navigation;
      const content = heading ? body.replace(heading[0], "") : body;
      return new Response(page(header + content, "shoots", url.searchParams.has("shoot") || url.searchParams.has("new")), { headers });
    } catch {
      return new Response(page(navigation + '<p class="notice" role="alert">دسترسی به چک‌لیست آفیش فعلاً ممکن نیست. دوباره تلاش کن.</p>'), { status: 503, headers });
    }
  }
  if (url.searchParams.get("view") === "pricing") {
    return teamPricing(request, 200, url.searchParams.has("saved") ? "قیمت‌ها ذخیره شدن." : "");
  }
  if (url.searchParams.get("view") === "qc") return websiteQc(request);
  if (url.searchParams.get("view") === "analytics") return websiteAnalytics(request, url);
  if (url.searchParams.get("view") === "feedback") return customerFeedback(request, url);
  if (url.searchParams.get("view") === "requests") return websiteRequests(request, url);
  try {
    const rows = await listMeetings();
    return new Response(page(`${await teamNavigation(request, "meetings")}<h1>قبل از جلسه، حرف‌هاش رو بخون.</h1><p>آخرین پاسخ‌های ذخیره‌شده کلاینت‌ها؛ هر ماه جدا نگه داشته می‌شه.</p>${rows.length ? rows.map(row => `<details class="card"><summary>${escape(row.doctorName)} · ${escape(row.meetingTitle || row.cycle)}<br><small>آخرین ذخیره: ${escape(new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(row.updatedAt)))}</small></summary>${row.booking ? `<div class="answer"><h3>طرح، آفیش و پرداخت</h3><p>${escape(bookingLines(row.booking))}</p><small>زمان آفیش پیشنهادی است و نیاز به هماهنگی تیم دارد.</small></div>` : ""}${Object.entries(labels).map(([key,label])=>`<div class="answer"><h3>${label}</h3><p>${escape(row.notes[key]) || "بدون یادداشت"}</p></div>`).join("")}</details>`).join("") : '<div class="card">هنوز پاسخی ذخیره نشده.</div>'}`), { headers });
  } catch { return new Response(page(await teamNavigation(request, "meetings") + '<p class="notice" role="alert">دریافت پاسخ‌ها فعلاً ممکن نیست. دوباره تلاش کن.</p>'), { status: 503, headers }); }
}
export async function POST(request: Request) {
  if (!teamConfigured()) return new Response("Team access unavailable", { status: 503, headers });
  const roleForSetup = await teamRole(request).catch(() => undefined);
  if (roleForSetup === undefined) return new Response("Team access unavailable", { status: 503, headers });
  const view = new URL(request.url).searchParams.get("view");
  if (view === "onboarding" || view === "password") {
    if (!roleForSetup) return login(request);
    return dashboardOnboarding(request, "team", "team:" + roleForSetup, readCookie(request, "romava_team_session"), roleForSetup === "creator" ? "/blackhorse?view=shoots" : "/blackhorse", teamPasswordHash(roleForSetup)!, key => teamCookie(request, false, roleForSetup, key));
  }
  if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return new Response("Unsupported form", { status: 415, headers });
  const form = await request.formData();
  const action = form.get("action");
  if (roleForSetup && action && action !== "logout") {
    const setup = await requireOnboarding("team", "team:" + roleForSetup);
    if (setup) return setup;
  }
  if (typeof action === "string" && action.startsWith("shoot-")) {
    const csrf = hash(readCookie(request, "romava_team_session") + ":shoot-checklists");
    if (!roleForSetup || form.get("csrf") !== csrf) return new Response("Forbidden", { status: 403, headers });
    try {
      const { changeShootChecklist } = await import("@/lib/shoot-checklists");
      const location = await changeShootChecklist(action, form);
      if (location) return new Response(null, { status: 303, headers: { ...headers, Location: location } });
      return new Response(page(await teamNavigation(request, "shoots") + '<p role="alert">اطلاعات فرم رو چک کن.</p><a href="/blackhorse?view=shoots">برگشت به آفیش‌ها</a>'), { status: 400, headers });
    } catch {
      return new Response(page(await teamNavigation(request, "shoots") + '<p role="alert">ذخیره انجام نشد. به فرم برگرد و دوباره تلاش کن.</p>'), { status: 503, headers });
    }
  }
  if (action === "save-pricing") {
    const csrf = hash(readCookie(request, "romava_team_session") + ":pricing");
    if (roleForSetup !== "manager" || form.get("csrf") !== csrf) return new Response("Forbidden", { status: 403, headers });
    const pricing = pricingFromForm(form);
    if (!pricing) return teamPricing(request, 400, "قیمت‌ها باید عدد مثبت به تومان باشن و درصد تخفیف بین ۰ تا ۱۰۰ باشه.");
    try {
      await savePricing(pricing);
      return new Response(null, { status: 303, headers: { ...headers, Location: "/blackhorse?view=pricing&saved=1" } });
    } catch {
      return teamPricing(request, 503, "ذخیرهٔ قیمت‌ها انجام نشد. دوباره تلاش کن.");
    }
  }
  if (action === "analytics-test") {
    const csrf = hash(readCookie(request, "romava_team_session") + ":analytics-test");
    const enabled = form.get("enabled");
    if (!roleForSetup || form.get("csrf") !== csrf || (enabled !== "0" && enabled !== "1")) {
      return new Response("Forbidden", { status: 403, headers });
    }
    const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
    const cookie = `${analyticsTestCookie}=${enabled}; Path=/; Max-Age=${enabled === "1" ? 31536000 : 0}; SameSite=Lax${secure}`;
    return new Response(null, { status: 303, headers: { ...headers, Location: "/blackhorse?view=qc", "Set-Cookie": cookie } });
  }
  if (form.get("action") === "logout" && roleForSetup && form.get("csrf") === hash(readCookie(request, "romava_team_session") + ":logout")) return new Response(null, { status: 303, headers: { ...headers, Location: "/blackhorse", "Set-Cookie": teamCookie(request, true) } });
  const csrf = readCookie(request, "romava_team_csrf");
  if (!/^[a-f0-9]{48}$/.test(csrf) || form.get("csrf") !== csrf) return login(request, "فرم ورود منقضی شده. دوباره وارد شو.");
  const password = form.get("password");
  const username = String(form.get("username") || "").trim().toLowerCase();
  const role: TeamRole | null = username === "romava" ? "manager" : username === "creator" ? "creator" : null;
  if (!role || typeof password !== "string" || password.length > 256) return login(request, "نام کاربری یا رمز عبور درست نیست.");
  try {
    const key = await teamLoginKey(role, password);
    if (!key) return login(request, "نام کاربری یا رمز عبور درست نیست.");
    return new Response(null, { status: 303, headers: { ...headers, Location: role === "creator" ? "/blackhorse?view=shoots" : "/blackhorse", "Set-Cookie": teamCookie(request, false, role, key) } });
  } catch { return new Response("Team access unavailable", { status: 503, headers }); }
}
