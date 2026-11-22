import { requireOnboarding } from "./onboarding";
import { guideSections } from "./client-guides-content";
import { clientNavigation } from "./dashboard-navigation";
import { activeReport, hash, htmlHeaders } from "./report-auth";

export async function clientGuide(request: Request) {
  let report;
  try { report = await activeReport(request); }
  catch { return new Response("Reports unavailable", { status: 503, headers: htmlHeaders }); }
  if (!report) return new Response(null, { status: 303, headers: { ...htmlHeaders, Location: "/admin" } });
  const setup = await requireOnboarding("client", "client:" + hash(report.token));
  if (setup) return setup;
  const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>شناخت و اصول همکاری | روماوا</title><style>
    @font-face{font-family:Yekan;src:url('/fonts/YekanBakh-Regular.ttf');font-display:swap}
    @font-face{font-family:Yekan;src:url('/fonts/YekanBakh-Bold.ttf');font-weight:700;font-display:swap}
    *{box-sizing:border-box}body{margin:0;background:#f5f6f8;color:#26324a;font:16px/1.9 Yekan,sans-serif}
    .page{max-width:800px;margin:auto;padding:18px 18px 124px}.guide{padding-top:24px}.guide>section+section{margin-top:28px}
    .guide-intro,.guide-card{padding:clamp(18px,5vw,30px);border:1px solid #dce3ef;border-radius:20px;background:#fff}
    .guide-intro{background:linear-gradient(120deg,#edf2ff,#fff 80%)}
    .guide-intro h2{margin:0;font-size:clamp(24px,5vw,34px);line-height:1.4}.guide-card h3{font-size:19px;line-height:1.55}
    .guide p{color:#526078;margin:8px 0 0}
    .guide-list{display:grid;gap:12px;margin:16px 0 0;padding:0;list-style:none}.guide-card h3{margin:0}
    .guide-rules{margin:12px 0 0;padding-inline-start:22px;color:#526078}.guide-rules li+li{margin-top:6px}
  </style></head><body><div class="page"><header class="topbar"></header><main class="guide">
    ${guideSections()}
  </main></div></body></html>`;
  return new Response(clientNavigation(html, report.token, "/r/collaboration"), { headers: htmlHeaders });
}
