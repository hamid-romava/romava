import { authenticated, meetingCsrf, reportHeaders, reports } from "@/lib/report-auth";
import { clientMeetings, saveMeeting, validSession, validateAnswers } from "@/lib/meeting-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: reportHeaders });
function account(request: Request) { return Object.values(reports()).find(report => authenticated(request, report)); }
export async function GET(request: Request) {
  try {
    const report = account(request); if (!report) return json({ error: "unauthorized" }, 401);
    const sessions = await clientMeetings(report.token);
    return json({ sessions });
  } catch { return json({ error: "storage_unavailable" }, 503); }
}
export async function PUT(request: Request) {
  try {
    const report = account(request); if (!report) return json({ error: "unauthorized" }, 401);
    if (request.headers.get("x-csrf-token") !== meetingCsrf(request)) return json({ error: "forbidden" }, 403);
    if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "invalid_content_type" }, 415);
    if (Number(request.headers.get("content-length") || 0) > 150000) return json({ error: "too_large" }, 413);
    const text = await request.text(); if (text.length > 60000) return json({ error: "too_large" }, 413);
    const input = JSON.parse(text), answers = validateAnswers(input);
    if (!answers || !validSession(input.sessionId)) return json({ error: "invalid_answers" }, 400);
    const saved = await saveMeeting(report.token, report.data.name, input.sessionId, answers);
    return saved ? json(saved) : json({ error: "already_submitted" }, 409);
  } catch (error) { return json({ error: error instanceof SyntaxError ? "invalid_json" : "storage_unavailable" }, error instanceof SyntaxError ? 400 : 503); }
}
