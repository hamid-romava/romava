import { reportTemplate } from "@/lib/report-template";
import { authenticated, hash, htmlHeaders, reportHeaders, reports, sessionCookie } from "@/lib/report-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ token: string }> };

function findReport(token: string) {
  if (!/^[a-f0-9]{48}$/.test(token)) return new Response("Not found", { status: 404, headers: reportHeaders });
  try {
    const report = reports()[hash(token)];
    if (!report) return new Response("Not found", { status: 404, headers: reportHeaders });
    return report;
  } catch {
    return new Response("Reports unavailable", { status: 503, headers: reportHeaders });
  }
}
export async function GET(request: Request, { params }: Context) {
  const { token } = await params;
  const report = findReport(token);
  if (report instanceof Response) return report;
  if (!authenticated(request, report)) return new Response(null, { status: 303, headers: { ...reportHeaders, Location: "/admin" } });
  const data = JSON.stringify(report.data).replace(/</g, "\\u003c");
  const logout = '<form method="post" class="report-logout"><input type="hidden" name="action" value="logout"><button class="control" type="submit">خروج از حساب ↗</button></form>';
  return new Response(reportTemplate.replace("__REPORT_DATA__", () => data).replace('<button class="control" aria-label="اعلان‌ها">♧</button>', logout), { headers: htmlHeaders });
}

export async function POST(request: Request, { params }: Context) {
  const { token } = await params;
  const report = findReport(token);
  if (report instanceof Response) return report;
  if (!authenticated(request, report)) return new Response(null, { status: 303, headers: { ...reportHeaders, Location: "/admin" } });
  if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return new Response("Unsupported form", { status: 415, headers: reportHeaders });
  const form = await request.formData().catch(() => null);
  if (form?.get("action") !== "logout") return new Response("Bad request", { status: 400, headers: reportHeaders });
  return new Response(null, { status: 303, headers: { ...reportHeaders, Location: "/admin", "Set-Cookie": sessionCookie(request, report, "", 0) } });
}
