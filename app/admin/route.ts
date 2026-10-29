import { loginTemplate } from "@/lib/report-login";
import { createSession, equal, hash, htmlHeaders, normalize, reportHeaders, reports, username } from "@/lib/report-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(loginTemplate(), { headers: htmlHeaders });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  if (request.headers.get("origin") !== url.origin) return new Response("Forbidden", { status: 403, headers: reportHeaders });
  if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return new Response("Unsupported form", { status: 415, headers: reportHeaders });
  const form = await request.formData().catch(() => null);
  if (!form) return new Response("Invalid form", { status: 400, headers: reportHeaders });
  const name = form.get("username"), password = form.get("password");
  if (typeof name !== "string" || typeof password !== "string") return new Response(loginTemplate(true), { status: 401, headers: htmlHeaders });
  let allReports;
  try { allReports = Object.values(reports()); } catch { return new Response("Reports unavailable", { status: 503, headers: reportHeaders }); }
  const passwordHash = hash(password);
  const report = allReports.find(item => normalize(name) === username(item) && equal(passwordHash, item.passwordHash));
  if (!report) return new Response(loginTemplate(true), { status: 401, headers: htmlHeaders });
  return new Response(null, { status: 303, headers: { ...reportHeaders, Location: `/r/${report.token}`, "Set-Cookie": createSession(request, report) } });
}
