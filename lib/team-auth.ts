import { createHmac, randomBytes } from "node:crypto";
import { equal } from "@/lib/report-auth";
const cookieName = "romava_team_session";
const mac = (value: string) => createHmac("sha256", process.env.ROMAVA_TEAM_PASSWORD_HASH || "").update(`team-v1:${value}`).digest("hex");
export function teamConfigured() { return /^[a-f0-9]{64}$/.test(process.env.ROMAVA_TEAM_PASSWORD_HASH || ""); }
export function teamAuthenticated(request: Request) {
  if (!teamConfigured()) return false;
  const cookie = readCookie(request, cookieName), [expiry, signature] = cookie.split(".");
  const now = Math.floor(Date.now() / 1000);
  return /^\d{10}$/.test(expiry || "") && Number(expiry) > now && Number(expiry) <= now + 28800 && /^[a-f0-9]{64}$/.test(signature || "") && equal(signature, mac(expiry));
}
export function readCookie(request: Request, name: string) { return (request.headers.get("cookie") || "").split(";").map(x => x.trim()).find(x => x.startsWith(name + "="))?.slice(name.length + 1) || ""; }
export function teamCookie(request: Request, logout = false) {
  const expiry = String(Math.floor(Date.now() / 1000) + 28800);
  return `${cookieName}=${logout ? "" : `${expiry}.${mac(expiry)}`}; Path=/team; HttpOnly; SameSite=Strict; Max-Age=${logout ? 0 : 28800}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}
export function loginNonce() { return randomBytes(24).toString("hex"); }
