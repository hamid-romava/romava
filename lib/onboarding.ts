import type { MongoClient } from "mongodb";
import { hash, htmlHeaders } from "./report-auth";
import { guideSections } from "./client-guides-content";
import { cultureIntroduction } from "./team-culture-content";

type Audience = "client" | "team";
type SetupStep = { title: string; text: string; details?: string; check: string };

const steps: Record<Audience, readonly SetupStep[]> = {
  client: [
    { title: "شناخت و اصول همکاری", text: "اول با هم مرور کنیم سر ضبط چطور کار می‌کنیم و توی همکاری چه چیزهایی رو رعایت می‌کنیم.", details: guideSections(), check: "شناخت و اصول همکاری رو خوندم." },
    { title: "گزارش ماهانه", text: "بعد از ورود به داشبورد، پایین پنل روی دکمهٔ «گزارش ماهانه» بزن. بعد ماهی که می‌خوای رو انتخاب کن و «ادامه» رو بزن تا گزارش همون ماه باز بشه.", check: "راهنمای دیدن گزارش ماهانه رو خوندم." },
    { title: "چک‌لیست آمادگی آفیش", text: "قبل از روز ضبط، از نوار پایین برو به «آمادگی آفیش». هر موردی رو که آماده کردی تیک بزن تا ببینی چی مونده.", check: "راهنمای چک‌لیست آفیش رو خوندم." },
  ],
  team: [
    { title: "متمم فرهنگ‌نامه", text: "اول فرهنگ‌نامه رو توی سایت بخون.", details: cultureIntroduction, check: "فرهنگ‌نامه و متممش رو خوندم." },
  ],
};

async function state() {
  const { default: connection } = await import("@/lib/mongodb") as { default: Promise<MongoClient> | null };
  if (!connection) throw new Error("Onboarding storage unavailable");
  return (await connection).db("mydb").collection<{ _id: string; step: number; updatedAt: Date }>("dashboard_onboarding");
}

export function setupRedirect(location: string) {
  return new Response(null, { status: 303, headers: { ...htmlHeaders, Location: location } });
}

function unavailable() {
  return new Response("دریافت وضعیت شروع داشبورد ممکن نیست. دوباره امتحان کن.", { status: 503, headers: htmlHeaders });
}

function setupPath(audience: Audience) {
  return audience === "client" ? "/r/onboarding" : "/blackhorse?view=onboarding";
}

async function progress(id: string) {
  return (await (await state()).findOne({ _id: id }))?.step ?? 0;
}

export async function requireOnboarding(audience: Audience, id: string) {
  try {
    return await progress(id) < steps[audience].length ? setupRedirect(setupPath(audience)) : null;
  } catch { return unavailable(); }
}

function screen(step: SetupStep, index: number, total: number, action: string, csrf: string) {
  const fa = new Intl.NumberFormat("fa-IR");
  return new Response(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${step.title} | روماوا</title><style>
  @font-face{font-family:Yekan;src:url('/fonts/YekanBakh-Regular.ttf');font-display:swap}
  *{box-sizing:border-box}body{margin:0;background:linear-gradient(145deg,#edf2ff,#fafbfe 65%);color:#26324a;font:16px/1.9 Yekan,sans-serif}
  main{width:min(100%,570px);min-height:100svh;margin:auto;padding:36px 24px;display:grid;align-content:center}
  h1{font-size:clamp(24px,6vw,34px);margin:0}p{color:#526078}a{color:#234fea}
  header{text-align:center;margin-bottom:16px}header img{width:102px}header small{display:block;color:#526078;margin-top:14px}
  details,form{background:white;border:1px solid #dce3ef;border-radius:16px;padding:16px;margin-top:14px}
  summary{cursor:pointer;color:#234fea}h2,h3,h4{margin-bottom:4px}
  form{display:grid;gap:14px}label{display:flex;gap:10px;align-items:center}input[type=checkbox]{width:19px;height:19px;accent-color:#2855f5}
  button{min-height:46px;border:0;border-radius:11px;background:#2855f5;color:#fff;font:inherit;cursor:pointer}button:disabled{opacity:.45;cursor:default}
  :focus-visible{outline:2px solid #2855f5;outline-offset:3px}
  </style></head><body><main><header><img src="/brand/romava-logo-focus.svg" alt="روماوا"><small>${fa.format(index+1)} از ${fa.format(total)}</small><h1>${step.title}</h1><p>${step.text}</p></header>
  ${step.details ? `<details><summary>${step.title} رو بخون</summary>${step.details}</details>` : ""}
  <form method="post" action="${action.replaceAll("&","&amp;")}"><input type="hidden" name="csrf" value="${csrf}"><input type="hidden" name="step" value="${index}"><label><input type="checkbox" name="confirmed" value="1" required>${step.check}</label><button>${index+1 === total ? "ورود به داشبورد" : "ادامه"}</button></form>
  </main><script src="/dashboard-onboarding.js" defer></script></body></html>`, { headers: htmlHeaders });
}

export async function dashboardOnboarding(request: Request, audience: Audience, id: string, session: string, destination: string) {
  const flow = steps[audience], path = setupPath(audience);
  const csrf = hash(session + ":dashboard-onboarding");
  try {
    const step = await progress(id);
    if (step >= flow.length) return setupRedirect(destination);
    if (request.method !== "POST") return screen(flow[step], step, flow.length, path, csrf);
    if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return new Response(null, { status: 415, headers: htmlHeaders });
    const form = await request.formData().catch(() => null);
    if (!form || form.get("csrf") !== csrf) return new Response("Forbidden", { status: 403, headers: htmlHeaders });
    if (form.get("confirmed") !== "1" || form.get("step") !== String(step)) return setupRedirect(path);
    const result = await (await state()).updateOne({ _id: id, step }, { $set: { step: step + 1, updatedAt: new Date() } }, { upsert: step === 0 })
      .catch(error => { if (error?.code === 11000) return null; throw error; });
    return setupRedirect(result && step + 1 === flow.length ? destination : path);
  } catch { return unavailable(); }
}
