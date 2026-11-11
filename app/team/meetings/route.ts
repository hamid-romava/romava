import type { MongoClient } from "mongodb";
import { bookingLines } from "@/lib/meeting-booking";
import { hash, equal, htmlHeaders } from "@/lib/report-auth";
import { listMeetings } from "@/lib/meeting-store";
import { loginNonce, readCookie, teamAuthenticated, teamConfigured, teamCookie } from "@/lib/team-auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
const headers = { ...htmlHeaders, "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; font-src 'self'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'" };
const labels: Record<string, string> = { liked: "چی به دلش نشست؟", improve: "کجا جای بهترشدن داره؟", results: "خبرهای پشت پیج", "next-month": "رویدادها و اتفاق‌های پیش رو", ideas: "ایده‌های پیشنهادی" };
function page(body: string) { return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>پنل تیم روماوا</title><style>@font-face{font-family:Yekan;src:url('/fonts/YekanBakh-Regular.ttf')}*{box-sizing:border-box}body{font:14px/2 Yekan,sans-serif;background:#f7f8fa;color:#26324a;margin:0}.page{max-width:900px;margin:auto;padding:28px 20px}header{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid #e1e6f0;padding-bottom:20px}header img{width:100px}h1{font-size:26px;margin:30px 0 8px}p{color:#788397}button,input{font:inherit}button{cursor:pointer;background:#2855f5;color:white;border:0;border-radius:10px;padding:10px 20px}input{display:block;width:100%;border:1px solid #dce2ef;padding:12px;border-radius:10px;margin:8px 0 18px}.login{max-width:390px;margin:60px auto}.card{background:white;border:1px solid #e1e6ef;border-radius:16px;margin:16px 0;padding:20px}summary{cursor:pointer;font-weight:bold}small{color:#8792a5}.answer{padding:15px 0;border-bottom:1px solid #edf0f6}.answer:last-child{border:0}.answer h3{font-size:13px;margin:0}.answer p{white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0 0;color:#58677e}.notice{background:#fff3d6;border-radius:12px;padding:15px}.logout{background:white;color:#68738c;border:1px solid #dce2ef}label{display:block}.team-nav,.paging{display:flex;flex-wrap:wrap;gap:10px;margin:20px 0}.team-nav a,.paging a{padding:6px 14px;border:1px solid #dce2ef;border-radius:10px;color:#26324a;text-decoration:none;background:white}.team-nav a[aria-current]{background:#2855f5;color:white;border-color:#2855f5}.contact-meta{margin:10px 0 0}.contact-meta div{display:flex;gap:10px;flex-wrap:wrap}.contact-meta dt{color:#58677e}.contact-meta dd{margin:0;overflow-wrap:anywhere}</style></head><body><div class="page">${body}</div></body></html>`; }
function login(request: Request, error = "") {
  const nonce = loginNonce();
  return new Response(page(`<header><img src="/brand/romava-logo-focus.svg" alt="روماوا"><span>ورود تیم</span></header><form class="login" method="post"><h1>پاسخ‌های جلسه اینجاست.</h1>${error ? `<p role="alert">${escape(error)}</p>` : ""}<input type="hidden" name="csrf" value="${nonce}"><label>نام کاربری<input name="username" autocomplete="username" required></label><label>رمز عبور<input name="password" type="password" autocomplete="current-password" required></label><button>ورود به پنل تیم</button></form>`), { headers: { ...headers, "Set-Cookie": `romava_team_csrf=${nonce}; Path=/team; HttpOnly; SameSite=Strict; Max-Age=600${new URL(request.url).protocol === "https:" ? "; Secure" : ""}` } });
}
function teamNavigation(request: Request, active: "meetings" | "requests") {
  return `<header><img src="/brand/romava-logo-focus.svg" alt="روماوا"><form method="post" action="/team/meetings"><input type="hidden" name="action" value="logout"><input type="hidden" name="csrf" value="${hash(readCookie(request, "romava_team_session") + ":logout")}"><button class="logout">خروج</button></form></header><nav class="team-nav" aria-label="بخش‌های پنل تیم">
    <a href="/team/meetings"${active === "meetings" ? ' aria-current="page"' : ""}>پاسخ جلسات</a>
    <a href="/team/meetings?view=requests"${active === "requests" ? ' aria-current="page"' : ""}>درخواست‌های سایت</a>
  </nav>`;
}

function contactDate(value: unknown) {
  if (typeof value !== "string" && !(value instanceof Date)) return "تاریخ ثبت نامشخص";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "تاریخ ثبت نامشخص" : new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran",
  }).format(date);
}

async function websiteRequests(request: Request, url: URL) {
  const navigation = teamNavigation(request, "requests");
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

export async function GET(request: Request) {
  if (!teamConfigured()) return new Response("Team access unavailable", { status: 503, headers });
  if (!teamAuthenticated(request)) return login(request);
  const url = new URL(request.url);
  if (url.searchParams.get("view") === "requests") return websiteRequests(request, url);
  try {
    const rows = await listMeetings();
    return new Response(page(`${teamNavigation(request, "meetings")}<h1>قبل از جلسه، حرف‌هاش رو بخون.</h1><p>آخرین پاسخ‌های ذخیره‌شده کلاینت‌ها؛ هر ماه جدا نگه داشته می‌شه.</p>${rows.length ? rows.map(row => `<details class="card"><summary>${escape(row.doctorName)} · ${escape(row.meetingTitle || row.cycle)}<br><small>آخرین ذخیره: ${escape(new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(row.updatedAt)))}</small></summary>${row.booking ? `<div class="answer"><h3>طرح، آفیش و پرداخت</h3><p>${escape(bookingLines(row.booking))}</p><small>زمان آفیش پیشنهادی است و نیاز به هماهنگی تیم دارد.</small></div>` : ""}${Object.entries(labels).map(([key,label])=>`<div class="answer"><h3>${label} ${row.ready[key] ? "✓" : ""}</h3><p>${escape(row.notes[key]) || "بدون یادداشت"}</p></div>`).join("")}</details>`).join("") : '<div class="card">هنوز پاسخی ذخیره نشده.</div>'}`), { headers });
  } catch { return new Response(page(teamNavigation(request, "meetings") + '<p class="notice" role="alert">دریافت پاسخ‌ها فعلاً ممکن نیست. دوباره تلاش کن.</p>'), { status: 503, headers }); }
}
export async function POST(request: Request) {
  if (!teamConfigured()) return new Response("Team access unavailable", { status: 503, headers });
  if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return new Response("Unsupported form", { status: 415, headers });
  const form = await request.formData();
  if (form.get("action") === "logout" && teamAuthenticated(request) && form.get("csrf") === hash(readCookie(request, "romava_team_session") + ":logout")) return new Response(null, { status: 303, headers: { ...headers, Location: "/team/meetings", "Set-Cookie": teamCookie(request, true) } });
  const csrf = readCookie(request, "romava_team_csrf");
  if (!/^[a-f0-9]{48}$/.test(csrf) || form.get("csrf") !== csrf) return login(request, "فرم ورود منقضی شده. دوباره وارد شو.");
  const password = form.get("password");
  if (String(form.get("username") || "").trim().toLowerCase() !== "romava" || typeof password !== "string" || password.length > 256 || !equal(hash(password), process.env.ROMAVA_TEAM_PASSWORD_HASH!)) return login(request, "نام کاربری یا رمز عبور درست نیست.");
  return new Response(null, { status: 303, headers: { ...headers, Location: "/team/meetings", "Set-Cookie": teamCookie(request) } });
}
