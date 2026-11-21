import { dashboardOnboarding, setupRedirect } from "../../../lib/onboarding";
import { authenticated, hash, htmlHeaders, meetingCsrf, reports } from "../../../lib/report-auth";

function setup(request: Request) {
  try {
    const report = Object.values(reports()).find(report => authenticated(request, report));
    if (!report) return setupRedirect("/admin");
    return dashboardOnboarding(request, "client", "client:" + hash(report.token), meetingCsrf(request), `/r/${report.token}?view=monthly`);
  } catch { return new Response("Reports unavailable", { status: 503, headers: htmlHeaders }); }
}

export const GET = setup;
export const POST = setup;
