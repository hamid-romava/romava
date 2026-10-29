import { loginTemplate } from "@/lib/report-login";
import { randomBytes } from "node:crypto";
import { createSession, equal, hash, htmlHeaders, normalize, reportHeaders, reports, username } from "@/lib/report-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const csrfCookieName = "romava_report_login_csrf";
function csrfCookie(request: Request, token: string) {
  return `${csrfCookieName}=${token}; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=600${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}
function newCsrfToken() { return randomBytes(24).toString("hex"); }

export async function GET(request: Request) {
  const csrf = newCsrfToken();
  return new Response(loginTemplate(csrf), { headers: { ...htmlHeaders, "Set-Cookie": csrfCookie(request, csrf) } });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return new Response("Unsupported form", { status: 415, headers: reportHeaders });
  const form = await request.formData().catch(() => null);
  if (!form) return new Response("Invalid form", { status: 400, headers: reportHeaders });
  const submittedCsrf = form.get("csrf");
  const storedCsrf = (request.headers.get("cookie") || "").split(";").map(part => part.trim()).find(part => part.startsWith(`${csrfCookieName}=`))?.slice(csrfCookieName.length + 1) || "";
  if (typeof submittedCsrf !== "string" || !/^[a-f0-9]{48}$/.test(storedCsrf) || !equal(submittedCsrf, storedCsrf)) return new Response("Forbidden", { status: 403, headers: reportHeaders });
  const name = form.get("username"), password = form.get("password");
  if (typeof name !== "string" || typeof password !== "string") return new Response(loginTemplate(storedCsrf, true), { status: 401, headers: htmlHeaders });
  let allReports;
  try { allReports = Object.values(reports()); } catch { return new Response("Reports unavailable", { status: 503, headers: reportHeaders }); }
  const passwordHash = hash(password);
  const report = allReports.find(item => normalize(name) === username(item) && equal(passwordHash, item.passwordHash));
  if (!report) return new Response(loginTemplate(storedCsrf, true), { status: 401, headers: htmlHeaders });
  return new Response(null, { status: 303, headers: { ...reportHeaders, Location: `/r/${report.token}`, "Set-Cookie": createSession(request, report) } });
}
