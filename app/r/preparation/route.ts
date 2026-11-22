import { requireOnboarding } from "@/lib/onboarding";
import { clientNavigation } from "../../../lib/dashboard-navigation";
import { preparationTemplate } from "@/lib/preparation-template";
import { activeReport, hash, htmlHeaders } from "@/lib/report-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  let report;
  try { report = await activeReport(request); }
  catch { return new Response("Reports unavailable", { status: 503, headers: htmlHeaders }); }
  if (!report) return new Response(null, { status: 303, headers: { ...htmlHeaders, Location: "/admin" } });
  const setup = await requireOnboarding("client", "client:" + hash(report.token));
  if (setup) return setup;
  return new Response(clientNavigation(preparationTemplate(report.token, hash(`preparation-v1:${report.token}`)), report.token, "/r/preparation"), {
    headers: { ...htmlHeaders, "Content-Security-Policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self'; font-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'" },
  });
}
