import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { reportTemplate } from "@/lib/report-template";
import { loginTemplate } from "@/lib/report-login";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};
const htmlHeaders = { ...headers, "Content-Type": "text/html; charset=utf-8" };
const lifetime = 8 * 60 * 60;
type Report = { passwordHash: string; data: Record<string, unknown> };
type Context = { params: Promise<{ token: string }> };
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const normalize = (value: string) => value.normalize("NFKC").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[\s\u200c]+/g, " ").trim().replace(/^دکتر\s+/, "");
const username = (report: Report) => normalize(String(report.data.name));
const cookieName = (token: string) => `romava_report_${hash(token).slice(0, 16)}`;
const signature = (token: string, report: Report, expiry: string) => createHmac("sha256", report.passwordHash).update(JSON.stringify(["report-session-v1", token, username(report), expiry])).digest("hex");
const equal = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

function getReport(token: string): Report | Response {
  if (!/^[a-f0-9]{48}$/.test(token)) return new Response("Not found", { status: 404, headers });
  try {
    const reports = JSON.parse(process.env.ROMAVA_REPORTS_CONFIG || "{}");
    const report = reports?.[hash(token)];
    if (!report || !/^[a-f0-9]{64}$/.test(report.passwordHash) || typeof report.data?.name !== "string") return new Response("Not found", { status: 404, headers });
    return report;
  } catch {
    return new Response("Reports unavailable", { status: 503, headers });
  }
}

function authenticated(request: Request, token: string, report: Report) {
  const cookie = (request.headers.get("cookie") || "").split(";").map(part => part.trim()).find(part => part.startsWith(`${cookieName(token)}=`))?.split("=").slice(1).join("=") || "";
  const [expiry, mac] = cookie.split(".");
  const now = Math.floor(Date.now() / 1000);
  return /^\d{10}$/.test(expiry || "") && Number(expiry) > now && Number(expiry) <= now + lifetime && /^[a-f0-9]{64}$/.test(mac || "") && equal(mac, signature(token, report, expiry));
}

function sessionCookie(request: Request, token: string, value: string, maxAge: number) {
  return `${cookieName(token)}=${value}; Path=/r/${token}; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}

export async function GET(request: Request, { params }: Context) {
  const { token } = await params;
  const report = getReport(token);
  if (report instanceof Response) return report;
  if (!authenticated(request, token, report)) return new Response(loginTemplate(), { headers: htmlHeaders });
  const data = JSON.stringify(report.data).replace(/</g, "\\u003c");
  const logout = '<form method="post" class="report-logout"><input type="hidden" name="action" value="logout"><button class="control" type="submit">خروج از حساب ↗</button></form>';
  return new Response(reportTemplate.replace("__REPORT_DATA__", () => data).replace('<button class="control" aria-label="اعلان‌ها">♧</button>', logout), { headers: htmlHeaders });
}

export async function POST(request: Request, { params }: Context) {
  const { token } = await params;
  const report = getReport(token);
  if (report instanceof Response) return report;
  const url = new URL(request.url);
  if (request.headers.get("origin") !== url.origin) return new Response("Forbidden", { status: 403, headers });
  if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return new Response("Unsupported form", { status: 415, headers });
  let form: FormData;
  try { form = await request.formData(); } catch { return new Response("Invalid form", { status: 400, headers }); }
  if (form.get("action") === "logout") return new Response(null, { status: 303, headers: { ...headers, Location: url.pathname, "Set-Cookie": sessionCookie(request, token, "", 0) } });
  const name = form.get("username"), password = form.get("password");
  if (typeof name !== "string" || typeof password !== "string" || normalize(name) !== username(report) || !equal(hash(password), report.passwordHash)) {
    return new Response(loginTemplate(true), { status: 401, headers: { ...htmlHeaders, "Set-Cookie": sessionCookie(request, token, "", 0) } });
  }
  const expiry = String(Math.floor(Date.now() / 1000) + lifetime);
  return new Response(null, { status: 303, headers: { ...headers, Location: url.pathname, "Set-Cookie": sessionCookie(request, token, `${expiry}.${signature(token, report, expiry)}`, lifetime) } });
}
