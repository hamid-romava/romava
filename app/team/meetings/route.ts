import { hash, equal, htmlHeaders } from "@/lib/report-auth";
import { listMeetings } from "@/lib/meeting-store";
import { loginNonce, readCookie, teamAuthenticated, teamConfigured, teamCookie } from "@/lib/team-auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
const headers = { ...htmlHeaders, "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; font-src 'self'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'" };
const labels: Record<string, string> = { liked: "چی به دلش نشست؟", improve: "کجا جای بهترشدن داره؟", results: "خبرهای پشت پیج", "next-month": "ماه بعد چه خبره؟", ideas: "ایده‌های پیشنهادی" };
function page(body: string) { return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>پاسخ جلسات | تیم روماوا</title><style>@font-face{font-family:Yekan;src:url('/fonts/YekanBakh-Regular.ttf')}*{box-sizing:border-box}body{font:14px/2 Yekan,sans-serif;background:#f7f8fa;color:#26324a;margin:0}.page{max-width:900px;margin:auto;padding:28px 20px}header{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid #e1e6f0;padding-bottom:20px}header img{width:100px}h1{font-size:26px;margin:30px 0 8px}p{color:#788397}button,input{font:inherit}button{cursor:pointer;background:#2855f5;color:white;border:0;border-radius:10px;padding:10px 20px}input{display:block;width:100%;border:1px solid #dce2ef;padding:12px;border-radius:10px;margin:8px 0 18px}.login{max-width:390px;margin:60px auto}.card{background:white;border:1px solid #e1e6ef;border-radius:16px;margin:16px 0;padding:20px}summary{cursor:pointer;font-weight:bold}small{color:#8792a5}.answer{padding:15px 0;border-bottom:1px solid #edf0f6}.answer:last-child{border:0}.answer h3{font-size:13px;margin:0}.answer p{white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0 0;color:#58677e}.notice{background:#fff3d6;border-radius:12px;padding:15px}.logout{background:white;color:#68738c;border:1px solid #dce2ef}label{display:block}</style></head><body><div class="page">${body}</div></body></html>`; }
function login(request: Request, error = "") {
  const nonce = loginNonce();
  return new Response(page(`<header><img src="/brand/romava-logo-focus.svg" alt="روماوا"><span>ورود تیم</span></header><form class="login" method="post"><h1>پاسخ‌های جلسه اینجاست.</h1>${error ? `<p role="alert">${escape(error)}</p>` : ""}<input type="hidden" name="csrf" value="${nonce}"><label>نام کاربری<input name="username" autocomplete="username" required></label><label>رمز عبور<input name="password" type="password" autocomplete="current-password" required></label><button>ورود به پنل تیم</button></form>`), { headers: { ...headers, "Set-Cookie": `romava_team_csrf=${nonce}; Path=/team; HttpOnly; SameSite=Strict; Max-Age=600${new URL(request.url).protocol === "https:" ? "; Secure" : ""}` } });
}
export async function GET(request: Request) {
  if (!teamConfigured()) return new Response("Team access unavailable", { status: 503, headers });
  if (!teamAuthenticated(request)) return login(request);
  try {
    const rows = await listMeetings();
    return new Response(page(`<header><img src="/brand/romava-logo-focus.svg" alt="روماوا"><form method="post"><input type="hidden" name="action" value="logout"><button class="logout">خروج</button></form></header><h1>قبل از جلسه، حرف‌هاش رو بخون.</h1><p>آخرین پاسخ‌های ذخیره‌شده کلاینت‌ها؛ هر ماه جدا نگه داشته می‌شه.</p>${rows.length ? rows.map(row => `<details class="card"><summary>${escape(row.doctorName)} · ${escape(row.cycle)}<br><small>آخرین ذخیره: ${escape(new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(row.updatedAt)))}</small></summary>${Object.entries(labels).map(([key,label])=>`<div class="answer"><h3>${label} ${row.ready[key] ? "✓" : ""}</h3><p>${escape(row.notes[key]) || "بدون یادداشت"}</p></div>`).join("")}</details>`).join("") : '<div class="card">هنوز پاسخی ذخیره نشده.</div>'}`), { headers });
  } catch { return new Response(page('<p class="notice" role="alert">دریافت پاسخ‌ها فعلاً ممکن نیست. دوباره تلاش کن.</p>'), { status: 503, headers }); }
}
export async function POST(request: Request) {
  if (!teamConfigured()) return new Response("Team access unavailable", { status: 503, headers });
  if (request.headers.get("origin") !== new URL(request.url).origin) return new Response("Forbidden", { status: 403, headers });
  if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return new Response("Unsupported form", { status: 415, headers });
  const form = await request.formData();
  if (form.get("action") === "logout" && teamAuthenticated(request)) return new Response(null, { status: 303, headers: { ...headers, Location: "/team/meetings", "Set-Cookie": teamCookie(request, true) } });
  const csrf = readCookie(request, "romava_team_csrf");
  if (!/^[a-f0-9]{48}$/.test(csrf) || form.get("csrf") !== csrf) return new Response("Forbidden", { status: 403, headers });
  const password = form.get("password");
  if (form.get("username") !== "romava" || typeof password !== "string" || password.length > 256 || !equal(hash(password), process.env.ROMAVA_TEAM_PASSWORD_HASH!)) return login(request, "نام کاربری یا رمز عبور درست نیست.");
  return new Response(null, { status: 303, headers: { ...headers, Location: "/team/meetings", "Set-Cookie": teamCookie(request) } });
}
