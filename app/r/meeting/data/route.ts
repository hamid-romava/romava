import { requireOnboarding } from "@/lib/onboarding";
import { getPricing } from "../../../../lib/pricing-store";
import { reportMeetingMonth, meetingMonthTitle } from "@/lib/meeting-booking";
import { reportDisplayName, activeReport, hash, meetingCsrf, reportHeaders } from "@/lib/report-auth";
import { clientMeetings, saveMeeting, validSession, validateAnswers } from "@/lib/meeting-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: reportHeaders });

export async function GET(request: Request) {
  try {
    const report = await activeReport(request); if (!report) return json({ error: "unauthorized" }, 401);
    const setup = await requireOnboarding("client", "client:" + hash(report.token));
    if (setup) return json({ error: "onboarding_required" }, setup.status === 303 ? 403 : setup.status);

    const sessions = await clientMeetings(report.token);
    return json({ sessions });
  } catch { return json({ error: "storage_unavailable" }, 503); }
}
export async function PUT(request: Request) {
  try {
    const report = await activeReport(request); if (!report) return json({ error: "unauthorized" }, 401);
    const setup = await requireOnboarding("client", "client:" + hash(report.token));
    if (setup) return json({ error: "onboarding_required" }, setup.status === 303 ? 403 : setup.status);

    if (request.headers.get("x-csrf-token") !== meetingCsrf(request)) return json({ error: "forbidden" }, 403);
    if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "invalid_content_type" }, 415);
    if (Number(request.headers.get("content-length") || 0) > 150000) return json({ error: "too_large" }, 413);
    const text = await request.text(); if (text.length > 60000) return json({ error: "too_large" }, 413);
    const input = JSON.parse(text), answers = validateAnswers(input, true, await getPricing());
    if (!answers || !validSession(input.sessionId)) return json({ error: "invalid_answers" }, 400);
    const reportMonth = reportMeetingMonth(report);
    if (input.reportMonth !== reportMonth) return json({ error: "report_month_changed" }, 422);
    if (typeof input.quotedTotal === "number" && input.quotedTotal !== answers.booking?.totalPrice) {
      return json({ error: "price_changed" }, 412);
    }
    const saved = await saveMeeting(report.token, reportDisplayName(report), input.sessionId, answers, { reportMonth, renewalMonth: reportMonth + 1, meetingTitle: meetingMonthTitle(reportMonth) });
    return saved ? json(saved) : json({ error: "already_submitted" }, 409);
  } catch (error) { return json({ error: error instanceof SyntaxError ? "invalid_json" : "storage_unavailable" }, error instanceof SyntaxError ? 400 : 503); }
}
