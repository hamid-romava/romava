import { dashboardOnboarding, setupRedirect } from "../../../lib/onboarding";
import { activeReport, createSession, htmlHeaders, meetingCsrf, reportAccountId } from "../../../lib/report-auth";

async function setup(request: Request) {
  try {
    const report = await activeReport(request);
    if (!report) return setupRedirect("/admin");
    return dashboardOnboarding(request, "client", reportAccountId(report), meetingCsrf(request), `/r/${report.token}?view=monthly`, report.passwordHash, key => createSession(request, report, key));
  } catch { return new Response("Reports unavailable", { status: 503, headers: htmlHeaders }); }
}

export const GET = setup;
export const POST = setup;
