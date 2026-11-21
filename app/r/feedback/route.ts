import { feedbackKinds, isFeedbackKind } from "../../../lib/feedback-types";
import { appendFile } from "node:fs/promises";
import { join } from "node:path";
import type { MongoClient } from "mongodb";

import { clientNavigation } from "../../../lib/dashboard-navigation";
import { authenticated, hash, htmlHeaders, meetingCsrf, reports, type Report } from "../../../lib/report-auth";

const path = "/r/feedback";

function account(request: Request) {
  return Object.values(reports()).find(report => authenticated(request, report));
}

function page(request: Request, report: Report, message = "", status = 200) {
  const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>انتقادات و پیشنهادات | روماوا</title><style>
  @font-face{font-family:Yekan;src:url('/fonts/YekanBakh-Regular.ttf');font-display:swap}
  *{box-sizing:border-box}body{margin:0;background:#f5f6f8;color:#26324a;font:16px/1.8 Yekan,sans-serif}
  .page{max-width:760px;margin:auto;padding:18px 18px 112px}.feedback-form{max-width:515px;margin:22px auto;padding:clamp(18px,5vw,32px);border:1px solid #dce3ef;border-radius:20px;background:#fff}
  form.feedback-form{display:grid;gap:16px}.feedback-form label{display:grid;gap:6px}
  .feedback-form :is(select,textarea,button){width:100%;min-height:46px;padding:9px 12px;border:1px solid #dce3ef;border-radius:11px;background:#f7f9fd;color:inherit;font:inherit}
  .feedback-form textarea{min-height:132px;resize:vertical}.feedback-form button{border:0;background:#2855f5;color:white;cursor:pointer}
  .feedback-form p{margin:0;color:#087452}.feedback-form .error{color:#9a302a}
  </style></head><body><div class="page"><header class="topbar"></header><main>
  <form class="feedback-form" method="post" action="${path}">
  <input type="hidden" name="csrf" value="${meetingCsrf(request)}">
  <label>نوع پیام<select name="kind" required><option value="">انتخاب کن</option>${Object.entries(feedbackKinds).map(([kind,label])=>`<option value="${kind}">${label}</option>`).join("")}</select></label>
  <label>پیامت<textarea name="message" maxlength="3000" required></textarea></label>
  ${message ? `<p role="${status === 200 ? "status" : "alert"}" class="${status === 200 ? "" : "error"}">${message}</p>` : ""}
  <button type="submit">ثبت پیام</button>
  </form></main></div></body></html>`;
  return new Response(clientNavigation(html, report.token, path), { status, headers: htmlHeaders });
}

const login = () => new Response(null, { status: 303, headers: { ...htmlHeaders, Location: "/admin" } });

export function GET(request: Request) {
  const report = account(request);
  if (!report) return login();
  return page(request, report);
}

export async function POST(request: Request) {
  const report = account(request);
  if (!report) return login();
  if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return page(request, report, "فرم رو دوباره باز کن و پیامت رو بفرست.", 415);
  if (Number(request.headers.get("content-length")) > 40000) return page(request, report, "پیامت باید کوتاه‌تر از ۳۰۰۰ نویسه باشه.", 413);
  const body = await request.text();
  if (body.length > 40000) return page(request, report, "پیامت باید کوتاه‌تر از ۳۰۰۰ نویسه باشه.", 413);
  const form = new URLSearchParams(body);
  if (form.get("csrf") !== meetingCsrf(request)) return page(request, report, "صفحه رو تازه کن و دوباره بفرست.", 403);
  const kind = form.get("kind");
  const message = form.get("message")?.trim();
  if (!isFeedbackKind(kind) || !message || message.length > 3000) return page(request, report, "نوع پیام رو انتخاب کن و متنش رو بنویس.", 400);
  try {
    const feedback = {
      clientId: hash(report.token), clientName: report.data.name, kind, message, createdAt: new Date(),
    };
    const testConfig = process.env.NODE_ENV === "development" && process.env.ROMAVA_TEST_REPORT_CONFIG;
    const isLocalTest = testConfig && JSON.parse(testConfig).digest === feedback.clientId
      && request.headers.get("host") === "127.0.0.1:3186";
    if (isLocalTest && !process.env.MONGODB_URI) {
      await appendFile(join(process.cwd(), ".next", "feedback-preview.jsonl"), JSON.stringify(feedback) + "\n", { mode: 0o600 });
    } else {
      const { default: connection } = await import("../../../lib/mongodb") as { default: Promise<MongoClient> | null };
      if (!connection) throw new Error("Feedback storage unavailable");
      await (await connection).db("mydb").collection("client_feedback").insertOne(feedback);
    }
    return new Response(null, { status: 303, headers: { ...htmlHeaders, Location: `/r/${report.token}?feedback=sent` } });
  } catch {
    return page(request, report, "پیام ثبت نشد. دوباره امتحان کن.", 503);
  }
}
