import { requireOnboarding } from "@/lib/onboarding";
import { reportSheet } from "../../../lib/report-sheet";
import { reportOverview } from "../../../lib/report-trends";
import { clientNavigation } from "../../../lib/dashboard-navigation";
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
  const authorized = await authenticated(request, report).catch(() => undefined);
  if (authorized === undefined) return new Response("Reports unavailable", { status: 503, headers: reportHeaders });
  if (!authorized) return new Response(null, { status: 303, headers: { ...reportHeaders, Location: "/admin" } });
  const setup = await requireOnboarding("client", "client:" + hash(report.token));
  if (setup) return setup;
  const months = Object.keys(report.months || {}).filter(key => /^[1-9]\d*$/.test(key)).sort((a, b) => Number(a) - Number(b));
  const query = new URL(request.url).searchParams;
  const embedded = query.get("sheet") === "1";
  const requested = query.get("month");
  const selected = requested ?? months.at(-1);
  if (requested !== null && !months.includes(requested)) return new Response("Month not found", { status: 404, headers: reportHeaders });
  const monthly = selected && report.months ? report.months[selected] : report.data;
  const data = JSON.stringify({ ...monthly, name: report.data.name }).replace(/</g, "\\u003c");
  const labels: Record<string, string> = { "1": "ماه اول", "2": "ماه دوم", "3": "ماه سوم", "4": "ماه چهارم", "5": "ماه پنجم", "6": "ماه ششم", "7": "ماه هفتم", "8": "ماه هشتم", "9": "ماه نهم", "10": "ماه دهم", "11": "ماه یازدهم", "12": "ماه دوازدهم" };
  const monthPicker = months.length ? `<form class="month-picker" method="get"><div class="month-controls"><select id="report-month" name="month" aria-label="انتخاب ماه گزارش">${months.map(month => `<option value="${month}"${month === selected ? " selected" : ""}>${labels[month] || `ماه ${new Intl.NumberFormat("fa-IR").format(Number(month))}`}</option>`).join("")}</select><button type="submit">نمایش</button></div></form>` : "";
  const path = `/r/${token}`;
  const monthHistory = months.map(month => ({
    id: month,
    label: labels[month] ?? `ماه ${new Intl.NumberFormat("fa-IR").format(Number(month))}`,
    stats: report.months![month],
  }));
  if (embedded) {
    const html = requested === null && months.length
      ? reportOverview(monthHistory, query.get("view") === "monthly")
      : reportTemplate.replace("__REPORT_DATA__", () => data).replace("__MONTH_PICKER__", "");
    return new Response(reportSheet(html), {
      headers: { ...htmlHeaders, "X-Frame-Options": "SAMEORIGIN", "Content-Security-Policy": "frame-ancestors 'self'" },
    });
  }
  const dashboard = (html: string, current: string) => {
    const page = clientNavigation(html, token, current);
    return new Response(query.get("feedback") === "sent"
      ? page.replace(/<main(?:\s[^>]*)?>/, main => main + '<p role="status" style="margin:0 0 16px;padding:10px 14px;border-radius:12px;background:#e8f6ee;color:#087452">پیامت ثبت شد.</p>')
      : page, { headers: htmlHeaders });
  };
  if (requested === null && months.length) {
    const chooseMonth = query.get("view") === "monthly";
    return dashboard(reportOverview(monthHistory, chooseMonth), chooseMonth ? path + "?view=monthly" : path);
  }
  const html = reportTemplate.replace("__REPORT_DATA__", () => data).replace("__MONTH_PICKER__", () => monthPicker);
  return dashboard(html, requested !== null || query.get("view") === "monthly" ? path + "?view=monthly" : path);
}

export async function POST(request: Request, { params }: Context) {
  const { token } = await params;
  const report = findReport(token);
  if (report instanceof Response) return report;
  const authorized = await authenticated(request, report).catch(() => undefined);
  if (authorized === undefined) return new Response("Reports unavailable", { status: 503, headers: reportHeaders });
  if (!authorized) return new Response(null, { status: 303, headers: { ...reportHeaders, Location: "/admin" } });
  if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return new Response("Unsupported form", { status: 415, headers: reportHeaders });
  const form = await request.formData().catch(() => null);
  if (form?.get("action") !== "logout") return new Response("Bad request", { status: 400, headers: reportHeaders });
  return new Response(null, { status: 303, headers: { ...reportHeaders, Location: "/admin", "Set-Cookie": sessionCookie(request, report, "", 0) } });
}
