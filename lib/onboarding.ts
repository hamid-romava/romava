import { createDashboardPassword, dashboardSetup, verifyDashboardPassword } from "./dashboard-password";
import { equal, hash, htmlHeaders } from "./report-auth";
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

export function setupRedirect(location: string) {
  return new Response(null, { status: 303, headers: { ...htmlHeaders, Location: location } });
}

function unavailable() {
  return new Response("دریافت وضعیت شروع داشبورد ممکن نیست. دوباره امتحان کن.", { status: 503, headers: htmlHeaders });
}

function setupPath(audience: Audience) {
  return audience === "client" ? "/r/onboarding" : "/blackhorse?view=onboarding";
}

export async function requireOnboarding(audience: Audience, id: string) {
  try {
    const setup = await (await dashboardSetup()).findOne({ _id: id });
    return !setup?.password || setup.step < steps[audience].length ? setupRedirect(setupPath(audience)) : null;
  } catch { return unavailable(); }
}

const passwordRule = "رمز جدید باید حداقل ۸ نویسه و ترکیبی از حرف و عدد باشه. حداقل یک عدد لازمه.";
const passwordStep = { title: "رمز عبور دلخواهت رو بذار", text: passwordRule, check: "" };

function screen(step: SetupStep, index: number, total: number, action: string, csrf: string, passwordForm = false, error = "", backTo?: string) {
  const fields = passwordForm ? `<label>رمز فعلی<input type="password" name="current-password" autocomplete="current-password" maxlength="256" required></label>
  <label>رمز جدید<input type="password" name="new-password" autocomplete="new-password" minlength="8" maxlength="256" required></label>
  <label>تکرار رمز جدید<input type="password" name="confirm-password" autocomplete="new-password" minlength="8" maxlength="256" required></label>` :
    `<label><input type="checkbox" name="confirmed" value="1" required>${step.check}</label>`;
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
  input[type=password]{width:100%;padding:10px;border:1px solid #dce3ef;border-radius:10px;font:inherit}
  .password-form label{display:grid;gap:4px}.setup-error{color:#9a302a;margin:0}
  button{min-height:46px;border:0;border-radius:11px;background:#2855f5;color:#fff;font:inherit;cursor:pointer}button:disabled{opacity:.45;cursor:default}
  :focus-visible{outline:2px solid #2855f5;outline-offset:3px}
  </style></head><body><main><header><img src="/brand/romava-logo-focus.svg" alt="روماوا">${backTo ? "" : `<small>${fa.format(index+1)} از ${fa.format(total)}</small>`}<h1>${step.title}</h1><p>${step.text}</p></header>
  ${step.details ? `<details><summary>${step.title} رو بخون</summary>${step.details}</details>` : ""}
  <form${passwordForm ? ' class="password-form"' : ""} method="post" action="${action.replaceAll("&","&amp;")}"><input type="hidden" name="csrf" value="${csrf}"><input type="hidden" name="step" value="${index}">${error ? `<p role="alert" class="setup-error">${error}</p>` : ""}${fields}<button>${backTo ? "ذخیرهٔ رمز جدید" : index+1 === total ? "ورود به داشبورد" : "ادامه"}</button></form>${backTo ? `<a href="${backTo}">بازگشت به داشبورد</a>` : ""}
  </main><script src="/dashboard-onboarding.js" defer></script></body></html>`, { status: error ? 400 : 200, headers: htmlHeaders });
}

export async function dashboardOnboarding(
  request: Request, audience: Audience, id: string, session: string, destination: string,
  initialPasswordHash: string, createCookie: (key: string) => string,
) {
  const flow = steps[audience], setupUrl = setupPath(audience);
  const changing = new URL(request.url).searchParams.get("view") === "password";
  const path = changing ? (audience === "client" ? "/r/onboarding?view=password" : "/blackhorse?view=password") : setupUrl;
  const csrf = hash(session + (changing ? ":dashboard-password-change" : ":dashboard-onboarding"));
  try {
    const collection = await dashboardSetup();
    const setup = await collection.findOne({ _id: id });
    const completed = setup?.step ?? 0;
    const needsPassword = !setup?.password;
    const finished = !needsPassword && completed >= flow.length;
    if (changing && !finished) return setupRedirect(setupUrl);
    if (!changing && finished) return setupRedirect(destination);
    const passwordForm = needsPassword || changing;
    const index = passwordForm ? 0 : completed + 1;
    const current = changing ? { ...passwordStep, title: "تغییر رمز عبور" } : needsPassword ? passwordStep : flow[completed];
    const render = (error = "") => screen(current, index, flow.length + 1, path, csrf, passwordForm, error, changing ? destination : undefined);
    if (request.method !== "POST") return render();
    if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return new Response(null, { status: 415, headers: htmlHeaders });
    const form = await request.formData().catch(() => null);
    if (!form || form.get("csrf") !== csrf) return new Response("Forbidden", { status: 403, headers: htmlHeaders });
    if (form.get("step") !== String(index)) return setupRedirect(path);

    if (passwordForm) {
      const old = form.get("current-password"), password = form.get("new-password");
      const previous = setup?.password;
      if (typeof old !== "string" || old.length > 256) return render("رمز فعلی درست نیست.");
      const matches = previous ? await verifyDashboardPassword(old, previous) : equal(hash(old), initialPasswordHash);
      if (!matches) return render("رمز فعلی درست نیست.");
      if (typeof password !== "string" || password.trim().length < 8 || password.length > 256 || !/\p{L}/u.test(password) || !/\p{Nd}/u.test(password)) return render(passwordRule);
      if (password === old) return render("رمز جدید باید با رمز فعلی فرق داشته باشه.");
      if (password !== form.get("confirm-password")) return render("رمز جدید و تکرارش یکی نیستن.");

      const credential = await createDashboardPassword(password);
      const filter = previous ? { _id: id, "password.sessionKey": previous.sessionKey } : { _id: id, password: { $exists: false } };
      const saved = await collection.updateOne(filter,
        { $set: { password: credential, updatedAt: new Date() }, $setOnInsert: { step: 0 } }, { upsert: needsPassword })
        .catch(error => { if (error?.code === 11000) return null; throw error; });
      if (!saved || saved.matchedCount + saved.upsertedCount !== 1) return setupRedirect(path);
      return new Response(null, { status: 303, headers: { ...htmlHeaders,
        Location: completed >= flow.length ? destination : path,
        "Set-Cookie": createCookie(credential.sessionKey),
      } });
    }

    if (form.get("confirmed") !== "1") return setupRedirect(path);
    const result = await collection.updateOne({ _id: id, step: completed }, { $set: { step: completed + 1, updatedAt: new Date() } });
    return setupRedirect(result.matchedCount === 1 && completed + 1 === flow.length ? destination : path);
  } catch { return unavailable(); }
}
