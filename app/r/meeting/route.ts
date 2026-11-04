import { currentCycle } from "@/lib/meeting-store";
import { meetingTemplate } from "@/lib/meeting-template";
import { authenticated, hash, htmlHeaders, reports } from "@/lib/report-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  let report;
  try { report = Object.values(reports()).find(item => authenticated(request, item)); }
  catch { return new Response("Reports unavailable", { status: 503, headers: htmlHeaders }); }
  if (!report) return new Response(null, { status: 303, headers: { ...htmlHeaders, Location: "/admin" } });
  return new Response(meetingTemplate(report.token, hash(`meeting-v1:${report.token}`), currentCycle()), {
    headers: { ...htmlHeaders, "Content-Security-Policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self'; connect-src 'self'; font-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'" },
  });
}
