import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const reportHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};
export const htmlHeaders = { ...reportHeaders, "Content-Type": "text/html; charset=utf-8" };
export const lifetime = 8 * 60 * 60;
export type Report = { token: string; passwordHash: string; data: { name: string; [key: string]: unknown } };
export const hash = (value: string) => createHash("sha256").update(value).digest("hex");
export const normalize = (value: string) => value.normalize("NFKC").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[\s\u200c]+/g, " ").trim().replace(/^دکتر\s+/, "");
export const username = (report: Report) => normalize(report.data.name);
export const equal = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const cookieName = "romava_report_session";
const signature = (report: Report, expiry: string) => createHmac("sha256", report.passwordHash).update(JSON.stringify(["report-session-v1", report.token, username(report), expiry])).digest("hex");

export function reports(): Record<string, Report> {
  const parsed = JSON.parse(process.env.ROMAVA_REPORTS_CONFIG || "{}");
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid report config");
  for (const [digest, report] of Object.entries(parsed) as [string, Report][]) {
    if (!/^[a-f0-9]{64}$/.test(digest) || !report || !/^[a-f0-9]{48}$/.test(report.token) || hash(report.token) !== digest || !/^[a-f0-9]{64}$/.test(report.passwordHash) || typeof report.data?.name !== "string") throw new Error("Invalid report entry");
  }
  return parsed;
}

export function authenticated(request: Request, report: Report) {
  const cookie = (request.headers.get("cookie") || "").split(";").map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`))?.split("=").slice(1).join("=") || "";
  const [expiry, mac] = cookie.split(".");
  const now = Math.floor(Date.now() / 1000);
  return /^\d{10}$/.test(expiry || "") && Number(expiry) > now && Number(expiry) <= now + lifetime && /^[a-f0-9]{64}$/.test(mac || "") && equal(mac, signature(report, expiry));
}

export function sessionCookie(request: Request, report: Report, value: string, maxAge: number) {
  return `${cookieName}=${value}; Path=/r; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}

export function createSession(request: Request, report: Report) {
  const expiry = String(Math.floor(Date.now() / 1000) + lifetime);
  return sessionCookie(request, report, `${expiry}.${signature(report, expiry)}`, lifetime);
}
